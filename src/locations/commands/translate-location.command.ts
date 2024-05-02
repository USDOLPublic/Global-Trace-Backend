import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@diginexhk/nestjs-command';
import { CountryRepository } from '~locations/repositories/country.repository';
import { DistrictRepository } from '~locations/repositories/district.repository';
import { ProvinceRepository } from '~locations/repositories/province.repository';
import { allSettled } from '~core/helpers/settled.helper';
import { GoogleTranslateService } from '~translate/services/google-translate.service';
import { chunk } from 'lodash';
import format from 'pg-format';

@Command({
    signature: 'translate-location',
    description: 'Translate location'
})
@Injectable()
export class TranslateLocationCommand extends BaseCommand {
    private targetLanguage = 'ur';

    private chunkLength = 1000;

    constructor(
        private districtRepo: DistrictRepository,
        private provinceRepo: ProvinceRepository,
        private countryRepo: CountryRepository,
        private googleTranslateService: GoogleTranslateService
    ) {
        super();
    }

    public async handle() {
        await this.translateCountries();
        await this.translateProvinces();
        await this.translateDistricts();
    }

    private async translateCountries() {
        this.info('Start translating countries');

        const countries = await this.countryRepo.find();
        await allSettled(
            countries.map(async (item) => {
                const countryName = await this.googleTranslateService.translateText(item.country, this.targetLanguage);
                await this.updateTranslation(this.countryRepo, item.id, this.targetLanguage, countryName);
            })
        );

        this.success(`Translated ${countries.length} countries successfully`);
    }

    private async translateProvinces() {
        this.info('Start translating provinces');

        const provinces = await this.provinceRepo.find();

        let chunkData = chunk(provinces, this.chunkLength);
        let count = 0;
        for (let chunkItem of chunkData) {
            await allSettled(
                chunkItem.map(async (item) => {
                    const provinceName = await this.googleTranslateService.translateText(
                        item.province,
                        this.targetLanguage
                    );
                    await this.updateTranslation(this.provinceRepo, item.id, this.targetLanguage, provinceName);
                })
            );
            count++;

            const currentIndex = Math.min(count * this.chunkLength, provinces.length);
            this.info(`Translated ${currentIndex}/${provinces.length} provinces`);
        }

        this.success(`Translated ${provinces.length} provinces successfully`);
    }

    private async translateDistricts() {
        this.info('Start translating districts');

        const districts = await this.districtRepo.find();
        let count = 0;
        let chunkData = chunk(districts, this.chunkLength);
        for (let chunkItem of chunkData) {
            await allSettled(
                chunkItem.map(async (item) => {
                    const districtName = await this.googleTranslateService.translateText(
                        item.district,
                        this.targetLanguage
                    );
                    await this.updateTranslation(this.districtRepo, item.id, this.targetLanguage, districtName);
                })
            );

            count++;

            const currentIndex = Math.min(count * this.chunkLength, districts.length);
            this.info(`Translated ${currentIndex}/${districts.length} districts`);
        }

        this.success(`Translated ${districts.length} districts successfully`);
    }

    private async updateTranslation(
        repo: CountryRepository | ProvinceRepository | DistrictRepository,
        id: string,
        languageCode: string,
        text: string
    ): Promise<void> {
        await repo
            .createQueryBuilder()
            .update()
            .set({
                translation: () => format('jsonb_set("translation", %L, %L)', `{${languageCode}}`, JSON.stringify(text))
            })
            .where({ id })
            .execute();
    }
}
