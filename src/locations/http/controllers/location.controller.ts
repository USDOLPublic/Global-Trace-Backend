import { BaseController } from '~core/http/controllers/base.controller';
import { LocationService } from '~locations/services/location.service';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { Id } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { CountryResponse } from '../response/country.response';
import { ProvinceResponse } from '../response/province.response';
import { DistrictResponse } from '../response/district.response';

@Controller('locations')
@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LocationController extends BaseController {
    constructor(private readonly locationService: LocationService) {
        super();
    }

    @Get('countries')
    @ResponseModel(CountryResponse, true)
    @ApiOperation({
        description: 'Search countries'
    })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    getAndSearchCountries(@Query('key') key: string): Promise<CountryResponse[]> {
        return this.locationService.getAndSearchCountries(key);
    }

    @Get('all-countries')
    @ResponseModel(CountryResponse, true)
    @ApiOperation({
        description: 'Search all countries'
    })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    getAndSearchAllCountries(@Query('key') key: string): Promise<CountryResponse[]> {
        return this.locationService.getAndSearchAllCountries(key);
    }

    @Get('provinces')
    @ResponseModel(ProvinceResponse, true)
    @ApiOperation({
        description: 'Search provinces'
    })
    @ApiQuery({
        name: 'countryId',
        required: true,
        type: String
    })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    listProvinces(@Id('countryId') countryId: string, @Query('key') key: string): Promise<ProvinceResponse[]> {
        return this.locationService.listProvinces(countryId, key);
    }

    @Get('districts')
    @ResponseModel(DistrictResponse, true)
    @ApiOperation({
        description: 'Search districts'
    })
    @ApiQuery({
        name: 'provinceId',
        required: true,
        type: String
    })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    listDistricts(@Id('provinceId') provinceId: string, @Query('key') key: string): Promise<DistrictResponse[]> {
        return this.locationService.listDistricts(provinceId, key);
    }
}
