import { Id } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import {
    Body,
    Controller,
    Get,
    Header,
    HttpCode,
    HttpStatus,
    Post,
    Res,
    StreamableFile,
    UploadedFile,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Connection, EntityManager } from 'typeorm';
import { RequireUploadTemplateFile } from '~core/decorators/require-upload-file.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { ProductTranslationService } from '~product-definitions/services/product-translation.service';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';
import { UploadProductTranslationFileDto } from '../dto/upload-product-translation-file.dto';
import { UploadProductTranslationResponse } from '../response/upload-product-translation.response';

@Controller('product-translations')
@ApiTags('Product Translation')
@ApiBearerAuth()
export class ProductTranslationController extends BaseController {
    constructor(private connection: Connection, private productTranslationService: ProductTranslationService) {
        super();
    }

    @Get('products')
    @UseGuards(ShortTokenGuard)
    @Header('Access-Control-Allow-Headers', 'X-Requested-With')
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="Product translate.json"')
    @ApiOperation({ description: 'Get all product translations' })
    @ApiQuery({
        name: 'shortToken',
        description: 'short token',
        required: true,
        type: String
    })
    async getProductTranslations(@Res() res: Response) {
        const data = await this.productTranslationService.getProductTranslations();
        const buffer = Buffer.from(JSON.stringify(data, null, 4), 'utf8');
        new StreamableFile(buffer).getStream().pipe(res);
    }

    @Post('products')
    @UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ResponseModel(UploadProductTranslationResponse)
    @ApiOperation({ description: 'Upload and validate product translation file' })
    @ApiConsumes('multipart/form-data')
    @RequireUploadTemplateFile({ fieldName: 'file', maxCount: 1 })
    uploadAndValidateProductTranslationFile(
        @Body() dto: UploadProductTranslationFileDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<UploadProductTranslationResponse> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.productTranslationService
                .withTransaction(manager)
                .uploadAndValidateProductTranslationFile(file);
        });
    }

    @Post('products/:id')
    @UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ description: 'Submit Product Translation File' })
    @ApiParam({
        name: 'id',
        description: 'File id',
        type: 'string'
    })
    saveProductTranslation(@Id() fileId: string): Promise<void> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.productTranslationService.withTransaction(manager).saveProductTranslation(fileId);
        });
    }

    @Get('attributes')
    @UseGuards(ShortTokenGuard)
    @Header('Access-Control-Allow-Headers', 'X-Requested-With')
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="Product attribute translate.json"')
    @ApiOperation({ description: 'Get all product attribute translations' })
    @ApiQuery({
        name: 'shortToken',
        description: 'short token',
        required: true,
        type: String
    })
    async getProductAttributeTranslations(@Res() res: Response) {
        const data = await this.productTranslationService.getProductAttributeTranslations();
        const buffer = Buffer.from(JSON.stringify(data, null, 4), 'utf8');
        new StreamableFile(buffer).getStream().pipe(res);
    }

    @Post('attributes')
    @UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ResponseModel(UploadProductTranslationResponse)
    @ApiOperation({ description: 'Upload and validate product attribute translation file' })
    @ApiConsumes('multipart/form-data')
    @RequireUploadTemplateFile({ fieldName: 'file', maxCount: 1 })
    uploadAndValidateProductAttributeTranslationFile(
        @Body() dto: UploadProductTranslationFileDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<UploadProductTranslationResponse> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.productTranslationService
                .withTransaction(manager)
                .uploadAndValidateProductAttributeTranslationFile(file);
        });
    }

    @Post('attributes/:id')
    @UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ description: 'Submit Product Attribute Translation File' })
    @ApiParam({
        name: 'id',
        description: 'File id',
        type: 'string'
    })
    saveProductAttributeTranslation(@Id() fileId: string): Promise<void> {
        return this.connection.transaction((manager: EntityManager) => {
            return this.productTranslationService.withTransaction(manager).saveProductAttributeTranslation(fileId);
        });
    }
}
