import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { LocationService } from './location.service';
import { CRAWL_LOCATION_JOB_OPTIONS } from '../constants/crawl-job-options.constant';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { env } from '~config/env.config';
import { RapidApiGeoDbBaseService } from '~http-client/rapid-api/geo-db/services/geodb-base.service';
import { CRAWL_LOCATIONS, PREPARE_CRAWL_DISTRICTS } from '~locations/constants/crawl-location-queue.constant';

@Injectable()
export class LocationCrawlService extends TransactionService {
    public constructor(
        @InjectQueue(CRAWL_LOCATIONS) private crawlLocationsQueue: Queue,
        private rapidGeoDbService: RapidApiGeoDbBaseService,
        private locationService: LocationService
    ) {
        super();
    }

    public crawlCountries(page: number = 1, name?: string) {
        return this.rapidGeoDbService.getCountry({
            offset: (page - 1) * env.RAPID_API.MAX_PAGE_LIMIT,
            limit: env.RAPID_API.MAX_PAGE_LIMIT,
            name
        });
    }

    async handleCrawlDistricts(countryCode: string) {
        let page = 1;
        let flag: boolean = true;
        do {
            const { items: crawledDistricts } = await this.rapidGeoDbService.getDistricts({
                offset: (page - 1) * env.RAPID_API.MAX_PAGE_LIMIT,
                limit: env.RAPID_API.MAX_PAGE_LIMIT,
                countryIds: countryCode
            });

            if (crawledDistricts.length) {
                await this.locationService.insertDistricts(crawledDistricts);
                page++;
            } else {
                flag = false;
            }
        } while (flag);
    }

    async crawlLocations() {
        const { items: countriesPage1 } = await this.crawlCountries(1);
        const { items: countriesPage2 } = await this.crawlCountries(2);
        const totalCountries = [...countriesPage1, ...countriesPage2];
        await this.locationService.addCountries(
            totalCountries.map(({ countryName, countryCode }) => ({ countryCode, country: countryName }))
        );
        for (const { countryCode } of totalCountries) {
            await this.crawlLocationsQueue.add(PREPARE_CRAWL_DISTRICTS, countryCode, CRAWL_LOCATION_JOB_OPTIONS);
        }
    }
}
