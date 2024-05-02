import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { In } from 'typeorm';
import { CountryEntity } from '~locations/entities/country.entity';
import { CountryItemInterface } from '~locations/interfaces/country-item.interface';
import { CustomRepository } from '@diginexhk/typeorm-helper';

@CustomRepository(CountryEntity)
export class CountryRepository extends BaseRepository<CountryEntity> {
    searchByKeyWord(key: string) {
        const query = this.createQueryBuilder('country');

        if (key) {
            query.where(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(key))
            });
        }

        query.andWhere({
            countryCode: In(['IN', 'CN', 'EG', 'KZ', 'MG', 'ML', 'MZ', 'PK', 'ZA', 'TJ', 'TR', 'US', 'OTHER'])
        });

        return query.orderBy({ country: 'ASC' }).getMany();
    }

    async insertOrIgnore(countries: CountryItemInterface[]) {
        await this.createQueryBuilder().insert().into(CountryEntity).values(countries).orIgnore(true).execute();
    }

    searchAllCountriesByKeyWord(key: string) {
        const query = this.createQueryBuilder('country');

        if (key) {
            query.where(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(key))
            });
        }

        return query.orderBy({ country: 'ASC' }).getMany();
    }
}
