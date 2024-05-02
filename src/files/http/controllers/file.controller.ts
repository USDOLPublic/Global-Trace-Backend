import { Id } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Connection, EntityManager } from 'typeorm';
import { RequireUploadTemplateFile } from '~core/decorators/require-upload-file.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { FacilityResponse } from '~facilities/http/response/facility.response';
import { BrandService } from '~facilities/services/brand.service';
import { UploadFileDto } from '~files/http/dto/upload-file.dto';
import { FileService } from '~files/services/file.service';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { UploadTemplateResponse } from '../response/upload-template.response';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { FacilityEntity } from '~facilities/entities/facility.entity';

@ApiTags('File')
@Controller('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FileController extends BaseController {
    constructor(private connection: Connection, private fileService: FileService, private brandService: BrandService) {
        super();
    }

    @Post('validate-supplier-templates')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(UploadTemplateResponse)
    @ApiOperation({ description: 'Upload and validate supplier template data' })
    @ApiConsumes('multipart/form-data')
    @RequireUploadTemplateFile({ fieldName: 'file', maxCount: 1 })
    uploadAndValidateTemplate(
        @Body() dto: UploadFileDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<UploadTemplateResponse> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.fileService.withTransaction(manager).uploadAndValidateTemplate(file);
        });
    }

    @Post(':id/import-suppliers')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(FacilityResponse, true)
    @ApiOperation({ description: 'Import validated suppliers' })
    @ApiParam({
        name: 'id',
        description: 'File id',
        type: 'string'
    })
    importSuppliers(@Id() fileId: string, @CurrentUser() user): Promise<FacilityEntity[]> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.brandService.withTransaction(manager).importSuppliersByTemplate(fileId, user);
        });
    }
}
