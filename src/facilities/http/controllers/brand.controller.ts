import { Id, Pagination, PaginationParams, SortMultipleParams, Sorts } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { AddSupplierDto } from '~facilities/http/dto/add-supplier.dto';
import { EditSupplierDto } from '~facilities/http/dto/edit-supplier.dto';
import { UpdateProfileBrandDto } from '~facilities/http/dto/update-profile-brand.dto';
import { BrandService } from '~facilities/services/brand.service';
import { FacilityService } from '~facilities/services/facility.service';
import { SupplierMappingService } from '~facilities/services/supplier-mapping.service';
import { IMAGE_UPLOAD_OPTIONS } from '~uploads/constants/upload.constant';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { BrandAddSuppliersResponse } from '../response/brand-add-suppliers.response';
import { BrandSupplierPaginationResponse } from '../response/brand-supplier-pagination.response';
import { FacilityWithUsersResponse } from '../response/facility-with-users.response';
import { FacilityResponse } from '../response/facility.response';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleResponse } from '~role-permissions/http/response/role.response';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { PaginationCollection } from '@diginexhk/typeorm-helper';

@Controller('brands')
@ApiTags('Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BrandController extends BaseController {
    constructor(
        private connection: Connection,
        private facilityService: FacilityService,
        private brandService: BrandService,
        private supplierMappingService: SupplierMappingService
    ) {
        super();
    }

    @Put('profile')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ApiOperation({ description: 'Update profile brand' })
    @ApiConsumes('multipart/form-data')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseInterceptors(FileInterceptor('logo', IMAGE_UPLOAD_OPTIONS))
    updateProfileBrand(
        @CurrentUser() user: UserEntity,
        @Body() dto: UpdateProfileBrandDto,
        @UploadedFile() logo?: Express.Multer.File
    ) {
        return this.facilityService.updateProfileBrand(user, dto, logo);
    }

    @Get('roles')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(RoleResponse, true)
    @ApiOperation({ description: 'Get list roles' })
    getSupplierRoles(): Promise<RoleResponse[]> {
        return this.brandService.getSupplierRoles(true);
    }

    @Get('suppliers/search')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(FacilityWithUsersResponse, true)
    @ApiOperation({ description: 'Get list business names' })
    @ApiQuery({ name: 'key', description: 'Search business by name', required: false })
    searchByName(@Query('key') key: string, @CurrentUser() user: UserEntity): Promise<FacilityEntity[]> {
        return this.facilityService.searchByName(user, key);
    }

    @Post('suppliers')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(BrandAddSuppliersResponse)
    @ApiOperation({ description: 'Add new supplier' })
    @AddRequestToBody()
    @HttpCode(HttpStatus.CREATED)
    addSupplier(@Body() dto: AddSupplierDto, @CurrentUser() user: UserEntity): Promise<FacilityEntity> {
        return this.connection.transaction((manager) =>
            this.brandService.withTransaction(manager).addSupplier(user, dto)
        );
    }

    @Delete('suppliers/:id')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ApiOperation({ description: 'Delete supplier' })
    @ApiParam({
        name: 'id',
        description: 'Supplier id',
        type: 'string'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteSupplier(@CurrentUser() user: UserEntity, @Id() id: string) {
        return this.brandService.deleteSupplier(user, id);
    }

    @Put('suppliers/:id')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ApiOperation({ description: 'Edit supplier' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({
        name: 'id',
        description: 'Supplier id',
        type: 'string'
    })
    @AddRequestToBody()
    editSupplierById(@CurrentUser() user: UserEntity, @Id() id: string, @Body() dto: EditSupplierDto) {
        return this.connection.transaction((manager) =>
            this.brandService.withTransaction(manager).editSupplierById(user, id, dto)
        );
    }

    @Get('business-partners')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(FacilityResponse, true)
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    @ApiOperation({ description: 'List and search business partners for supplier' })
    listAndSearchSupplierBusinessPartners(
        @CurrentUser() user: UserEntity,
        @Query('roleId') roleId: string,
        @Query('key') key?: string
    ): Promise<FacilityEntity[]> {
        return this.brandService.listAndSearchSupplierBusinessPartners(user, roleId, key);
    }

    @Get('suppliers/mapping')
    @UseGuards(PermissionGuard(PermissionEnum.SUPPLIER_MANAGEMENT))
    @ApiOperation({ description: 'Get supplier mapping list' })
    getSupplierMappingList(@CurrentUser() user: UserEntity) {
        return this.supplierMappingService.getMappingList(user);
    }

    @Get('/suppliers')
    @UseGuards(PermissionGuard(PermissionEnum.SUPPLIER_MANAGEMENT))
    @ResponseModel(BrandSupplierPaginationResponse)
    @ApiOperation({ description: 'Get list suppliers' })
    getListSuppliers(
        @CurrentUser() user: UserEntity,
        @Pagination() paginationParams: PaginationParams,
        @Sorts({
            allowedFields: ['users.lastLoginAt', 'name', 'overallRiskLevel', 'updatedAt', 'createdAt'],
            default: { sortField: 'createdAt', sortDirection: 'DESC' }
        })
        sort: SortMultipleParams[]
    ): Promise<PaginationCollection<FacilityEntity>> {
        return this.facilityService.getListSuppliers(user, paginationParams, sort);
    }
}
