import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { CRAWL_LOCATIONS_LIMITER } from './constants/crawl-job-limiter.constant';
import { CRAWL_LOCATIONS } from './constants/crawl-location-queue.constant';
import { DistrictEntity } from './entities/district.entity';
import { LocationController } from './http/controllers/location.controller';
import { CrawlLocationsProcessor } from './processors/crawl-locations.processor';
import { DistrictRepository } from './repositories/district.repository';
import { LocationCrawlService } from './services/location-crawl.service';
import { LocationService } from './services/location.service';
import { CrawlLocationCommand } from '~locations/commands/crawl-location.command';
import { HttpClientModule } from '~http-client/http-client.module';
import { cacheConfig } from '~config/cache.config';
import { CountryEntity } from './entities/country.entity';
import { CountryRepository } from '~locations/repositories/country.repository';
import { ProvinceRepository } from './repositories/province.repository';
import { ProvinceEntity } from '~locations/entities/province.entity';
import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { TranslateLocationCommand } from './commands/translate-location.command';
import { TranslateModule } from '~translate/translate.module';

@Module({
    providers: [
        LocationService,
        LocationCrawlService,
        CrawlLocationsProcessor,
        CrawlLocationCommand,
        TranslateLocationCommand
    ],
    controllers: [LocationController],
    imports: [
        TypeOrmHelperModule.forCustomRepository([
            CountryEntity,
            CountryRepository,
            DistrictEntity,
            DistrictRepository,
            ProvinceEntity,
            ProvinceRepository
        ]),
        BullModule.registerQueue({
            name: CRAWL_LOCATIONS,
            limiter: CRAWL_LOCATIONS_LIMITER
        }),
        forwardRef(() => HttpClientModule),
        cacheConfig,
        RolePermissionModule,
        TranslateModule
    ],
    exports: [LocationCrawlService, LocationService]
})
export class LocationModule {}
