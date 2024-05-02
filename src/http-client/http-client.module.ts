import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RapidApiGeoDbBaseService } from '~http-client/rapid-api/geo-db/services/geodb-base.service';
import { OpenApparelRegistryService } from '~http-client/open-apparel-registry/services/open-apparel-registry.service';
import { FacilityModule } from '~facilities/facility.module';
import { GoogleMapApiService } from '~http-client/google-map/services/google-map-api.service';
import { LocationModule } from '~locations/location.module';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 3
        }),
        forwardRef(() => FacilityModule),
        forwardRef(() => LocationModule)
    ],
    controllers: [],
    providers: [RapidApiGeoDbBaseService, OpenApparelRegistryService, GoogleMapApiService],
    exports: [RapidApiGeoDbBaseService, OpenApparelRegistryService, GoogleMapApiService]
})
export class HttpClientModule {}
