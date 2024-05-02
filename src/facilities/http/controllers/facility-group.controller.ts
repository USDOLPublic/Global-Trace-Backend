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
    Res,
    UploadedFile,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseController } from '~core/http/controllers/base.controller';
import { Response } from 'express';
import { Connection, DeleteResult, EntityManager } from 'typeorm';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { Id, Pagination, PaginationParams } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { FacilityGroupPaginationResponse } from '../response/facility-group-pagination.response';
import { FacilityGroupService } from '~facilities/services/facility-group.service';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { GetFacilityGroupByIdResponse } from '../response/get-facility-group-by-id.response';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';
import { UploadTemplateResponse } from '~files/http/response/upload-template.response';
import { RequireUploadTemplateFile } from '~core/decorators/require-upload-file.decorator';
import { QueryBoolean } from '~core/decorators/query-boolean.decorator';
import { ImportFacilityGroupDto } from '~facilities/http/dto/import-facility-group.dto';
import { ImportFacilityGroupService } from '~facilities/services/import/import-facility-group.service';
import { ValidateFacilityGroupService } from '~facilities/services/import/validate-facility-group.service';
import { FacilityGroupExcelService } from '~facilities/services/import/facility-group-excel.service';
import { UpdateImportFacilityGroupDto } from '../dto/update-import-facility-group.dto';
import { SelfAssessmentUploadFileEntity } from '~self-assessments/entities/self-assessment-upload-file.entity';

@Controller('facility-groups')
@ApiBearerAuth()
@ApiTags('FacilityGroups')
export class FacilityGroupController extends BaseController {
    constructor(
        private connection: Connection,
        private facilityGroupService: FacilityGroupService,
        private facilityGroupExcelService: FacilityGroupExcelService,
        private validateFacilityGroupService: ValidateFacilityGroupService,
        private importFacilityGroupService: ImportFacilityGroupService
    ) {
        super();
    }

    @Get('valid-download-template')
    @ApiQuery({ name: 'roleId', description: 'Id of the role user', required: true })
    validDownloadTemplate(@Query('roleId') roleId: string): Promise<void | SelfAssessmentUploadFileEntity> {
        return this.facilityGroupExcelService.validDownloadTemplate(roleId);
    }

    @Get('download-template')
    @UseGuards(ShortTokenGuard)
    @ApiQuery({
        name: 'shortToken',
        description: 'Short token',
        required: true,
        type: String
    })
    @ApiQuery({
        name: 'facilityGroupId',
        description: 'Facility Group Id',
        required: false,
        type: String
    })
    @ApiQuery({ name: 'roleId', description: 'Id of the role user', required: true })
    exportExcel(
        @Res() res: Response,
        @Query('roleId') roleId: string,
        @Query('facilityGroupId') facilityGroupId: string
    ): Promise<void> {
        return this.facilityGroupExcelService.getXlsxFile(res, roleId, facilityGroupId);
    }

    @Post('validate-import-template')
    @ResponseModel(UploadTemplateResponse)
    @ApiOperation({ description: 'Upload and validate farm group template data' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    @RequireUploadTemplateFile({ fieldName: 'file', maxCount: 1 })
    @ApiQuery({ name: 'isUpdating', required: false, type: 'boolean' })
    @ApiQuery({ name: 'roleId', description: 'Id of the role user', required: true })
    @ApiQuery({
        name: 'facilityGroupId',
        description: 'Facility Group Id',
        required: false,
        type: String
    })
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    uploadAndValidateTemplate(
        @UploadedFile() file: Express.Multer.File,
        @Query('roleId') roleId: string,
        @Query('facilityGroupId') facilityGroupId: string,
        @QueryBoolean('isUpdating') isUpdating: boolean = false
    ): Promise<UploadTemplateResponse> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.validateFacilityGroupService
                .withTransaction(manager)
                .uploadAndValidateTemplate(file, roleId, facilityGroupId, isUpdating);
        });
    }

    @Post('import-data')
    @ApiOperation({ description: 'Import farm group file data' })
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    importFacilityGroup(@Body() farmGroupDto: ImportFacilityGroupDto): Promise<void> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.importFacilityGroupService.withTransaction(manager).importFacilityGroup(farmGroupDto);
        });
    }

    @Put(':id/import-data')
    @ApiOperation({ description: 'Update farm group' })
    @ApiParam({
        name: 'id',
        description: 'farm group id',
        type: 'string'
    })
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @HttpCode(HttpStatus.NO_CONTENT)
    updateFacilityGroup(@Body() farmGroupDto: UpdateImportFacilityGroupDto, @Id() id: string): Promise<void> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.importFacilityGroupService.withTransaction(manager).updateFacilityGroup(id, farmGroupDto);
        });
    }

    @Get()
    @ApiOperation({ description: 'Get list facility group' })
    @ApiQuery({ name: 'roleId', description: 'Id of the role user', required: true })
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @ResponseModel(FacilityGroupPaginationResponse)
    getListFacilityGroup(
        @Query('roleId') roleId: string,
        @Pagination() paginationParams: PaginationParams
    ): Promise<PaginationCollection<FacilityEntity>> {
        return this.facilityGroupService.getListFacilityGroup(roleId, paginationParams);
    }

    @Get(':id')
    @ApiOperation({ description: 'View facility group' })
    @ApiParam({
        name: 'id',
        description: 'facility group id',
        type: 'string'
    })
    @ResponseModel(GetFacilityGroupByIdResponse)
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    getFacilityGroupById(@Id() id: string): Promise<FacilityEntity> {
        return this.facilityGroupService.getFacilityGroupById(id);
    }

    @Delete(':id')
    @ApiOperation({ description: 'Delete facility group' })
    @ApiParam({
        name: 'id',
        description: 'facility group id',
        type: 'string'
    })
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteFacilityGroup(@Id() id: string): Promise<DeleteResult> {
        return this.connection.transaction((manager) =>
            this.facilityGroupService.withTransaction(manager).deleteFacilityGroup(id)
        );
    }
}
