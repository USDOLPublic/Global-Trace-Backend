import { Id } from '@diginexhk/nestjs-base-decorator';
import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Readable } from 'stream';
import { BaseController } from '~core/http/controllers/base.controller';
import { PdfExportService } from '~pdf-exports/services/pdf-export.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';

@Controller('pdf-export')
@ApiBearerAuth()
@ApiTags('PdfExport')
export class PdfExportController extends BaseController {
    constructor(private pdfExportService: PdfExportService) {
        super();
    }

    @Get()
    @ApiOperation({ description: 'Get pdf data' })
    @ApiQuery({ name: 'token', required: true, type: 'string' })
    getPdfReportData(@Query('token') token: string) {
        return this.pdfExportService.getPdfData(token);
    }

    @Get('download')
    @UseGuards(ShortTokenGuard, PermissionGuard(PermissionEnum.TRACE_PRODUCT))
    @ApiOperation({ description: 'Export PDF of tracing an order' })
    @Header('Content-type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename="file.pdf"')
    @ApiQuery({
        name: 'timezone',
        description: 'timezone',
        required: true
    })
    @ApiQuery({
        name: 'orderId',
        description: 'order id',
        required: true
    })
    @ApiQuery({
        name: 'shortToken',
        description: 'short token',
        required: true,
        type: String
    })
    @ApiQuery({ name: 'language', description: 'Language code', required: false })
    async generatePdf(
        @Query('timezone') timezone: string,
        @Id('orderId') orderId: string,
        @Res() res: Response,
        @CurrentUser() user: UserEntity,
        @Query('language') language?: string
    ) {
        const file = await this.pdfExportService.generatePdf(orderId, timezone, user, language);
        Readable.from(file).pipe(res as any);
    }
}
