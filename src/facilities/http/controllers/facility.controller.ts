import { Id } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
    Put,
    Query,
    UseGuards,
    forwardRef
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { enumToList } from '~core/helpers/enum.helper';
import { BaseController } from '~core/http/controllers/base.controller';
import { EnumToListResponse } from '~core/http/response/enum-to-list.response';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { CertificationEnum } from '~facilities/enums/certification.enum';
import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { AddFacilityOarIdDto } from '~facilities/http/dto/add-facility-oar-id.dto';
import { CheckOarIdDto } from '~facilities/http/dto/check-oar-id.dto';
import { RegisterOarIdDto } from '~facilities/http/dto/register-oar-id.dto';
import { FacilityRiskFilerService } from '~facilities/services/facility-risk-filter.service';
import { FacilityService } from '~facilities/services/facility.service';
import { OrderFacilityService } from '~facilities/services/order-facility.service';
import { OpenApparelRegistryService } from '~http-client/open-apparel-registry/services/open-apparel-registry.service';
import { FacilityRiskFilterDto } from '~risk-assessments/http/dto/facility-risk-filter.dto';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { CheckOarIdResponse } from '../response/check-oar-id.response';
import { FacilityResponse } from '../response/facility.response';
import { GetBusinessPartnerResponse } from '../response/get-business-partner.response';
import { GetFacilityResponse } from '../response/get-facility.response';
import { RegisterOarIdConfirmMatchResponse } from '../response/register-oard-id-confirmation-match.response';

@Controller('facilities')
@ApiTags('Facilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FacilityController extends BaseController {
    constructor(
        private facilityService: FacilityService,
        private orderFacilityService: OrderFacilityService,
        private facilityRiskFilerService: FacilityRiskFilerService,
        @Inject(forwardRef(() => OpenApparelRegistryService))
        private openApparelRegistryService: OpenApparelRegistryService
    ) {
        super();
    }

    @Get('farm-certifications')
    @ResponseModel(EnumToListResponse, true)
    @ApiOperation({ description: 'Get a list of the farm certifications.' })
    gerFarmCertifications(): EnumToListResponse[] {
        return enumToList(FarmCertificationEnum);
    }

    @Get('chain-of-custody')
    @ResponseModel(EnumToListResponse, true)
    @ApiOperation({ description: 'Get a list of the chain of custody.' })
    getChainOfCustody(): EnumToListResponse[] {
        return enumToList<typeof ChainOfCustodyEnum>(ChainOfCustodyEnum);
    }

    @Get('certifications')
    @ResponseModel(EnumToListResponse, true)
    @ApiOperation({ description: 'Get list of certification' })
    getCertifications(): EnumToListResponse[] {
        return enumToList<typeof CertificationEnum>(CertificationEnum);
    }

    @Post('check-oarId')
    @ResponseModel(CheckOarIdResponse)
    @ApiOperation({ description: 'Check oarId' })
    checkOarId(@Body() dto: CheckOarIdDto): Promise<CheckOarIdResponse> {
        return this.openApparelRegistryService.checkOarId(dto);
    }

    @Post('register-oarIds')
    @ApiOperation({ description: 'Register oarId' })
    registerOarId(@Body() dto: RegisterOarIdDto) {
        return this.openApparelRegistryService.registerOarId(dto);
    }

    @Get('oar-ids/confirm-match')
    @ResponseModel(RegisterOarIdConfirmMatchResponse)
    @ApiOperation({ description: 'Confirm match oarId' })
    @ApiQuery({
        name: 'id',
        description: 'Facility match Id'
    })
    confirmMatchOarId(@Query('id') id: string): Promise<RegisterOarIdConfirmMatchResponse> {
        return this.openApparelRegistryService.confirmMatchOarId(id);
    }

    @Get('oar-ids/reject-match')
    @ResponseModel(RegisterOarIdConfirmMatchResponse)
    @ApiOperation({ description: 'Reject match oarId' })
    @ApiQuery({
        name: 'ids',
        description: 'Facility match Ids',
        example: '12334,53435,34223'
    })
    rejectMatchOarId(@Query('ids') ids: string): Promise<RegisterOarIdConfirmMatchResponse> {
        return this.openApparelRegistryService.rejectMatchOarIds(ids.split(','));
    }

    @Put('oarIds')
    @ApiOperation({ description: 'Update oarId for current user' })
    @AddRequestToBody()
    @HttpCode(HttpStatus.NO_CONTENT)
    addFacilityOarId(@CurrentUser() user: UserEntity, @Body() dto: AddFacilityOarIdDto) {
        return this.facilityService.addOarId(user, dto);
    }

    @Get()
    @ResponseModel(GetFacilityResponse, true)
    @UseGuards(PermissionGuard(PermissionEnum.SUBMIT_GRIEVANCE_REPORTS, PermissionEnum.SUBMIT_REPORTS))
    @ApiOperation({ description: 'Search facilities when creating a grievance report' })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    getAndSearchFacilities(@Query('key') key: string, @CurrentUser() user: UserEntity): Promise<FacilityEntity[]> {
        return this.facilityService.searchFacilities(
            { key, types: [RoleTypeEnum.PRODUCT], isExcludeAddedPartners: false },
            user
        );
    }

    @Get('list')
    @ResponseModel(FacilityResponse, true)
    @ApiOperation({ description: 'Get list of suppliers' })
    @ApiQuery({ name: 'key', description: 'Search by name', required: false })
    listSuppliers(@CurrentUser() user: UserEntity, @Query('key') key: string): Promise<FacilityEntity[]> {
        return this.orderFacilityService.getListOfSuppliers(user, key);
    }

    @Get(':id/partner-suppliers')
    @ResponseModel(FacilityResponse, true)
    @ApiOperation({ description: 'Get list of partner suppliers' })
    @ApiParam({
        name: 'id',
        description: 'Supplier ID',
        type: 'string'
    })
    @ApiQuery({ name: 'key', description: 'Search by name', required: false })
    listPartnerSuppliers(
        @CurrentUser() user: UserEntity,
        @Id() supplierId: string,
        @Query('key') key: string
    ): Promise<FacilityEntity[]> {
        return this.orderFacilityService.listPartnerSuppliers(user, supplierId, key);
    }

    @Get(':id')
    @ResponseModel(FacilityResponse)
    @UseGuards(
        PermissionGuard(
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT,
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT_IN_SUPPLIER_MANAGEMENT,
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT_IN_USER_MANAGEMENT
        )
    )
    @ApiOperation({ description: 'Get Information supplier' })
    @ApiParam({
        name: 'id',
        description: 'supplier id',
        type: 'string'
    })
    getInformationSupplierById(@Id() id: string, @Query() query: FacilityRiskFilterDto): Promise<FacilityEntity> {
        return this.facilityService.findInformationSupplierById(id, query);
    }

    @Get(':id/filter-values')
    @ApiOperation({ description: 'Get applicable filter values' })
    @UseGuards(
        PermissionGuard(
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT,
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT_IN_SUPPLIER_MANAGEMENT,
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT_IN_USER_MANAGEMENT
        )
    )
    getFilterValues(@Id() id: string, @Query() query: FacilityRiskFilterDto) {
        return this.facilityRiskFilerService.getFilterValues(id, query);
    }

    @Get(':id/business-partner')
    @ResponseModel(GetBusinessPartnerResponse, true)
    @ApiOperation({ description: 'Get business partner' })
    @ApiParam({
        name: 'id',
        description: 'facility id',
        type: 'string'
    })
    getBusinessPartnerByFacilityId(@Id() id: string): Promise<FacilityEntity[]> {
        return this.facilityService.findBusinessPartnerByFacilityId(id);
    }
}
