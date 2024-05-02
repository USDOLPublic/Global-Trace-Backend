import { Id } from '@diginexhk/nestjs-base-decorator';
import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Readable } from 'stream';
import { BaseController } from '~core/http/controllers/base.controller';
import { PdfExportService } from '~pdf-exports/services/pdf-export.service';
import { FacilityRiskFilterDto } from '~risk-assessments/http/dto/facility-risk-filter.dto';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';

@Controller('pdf-export/facility-details')
@ApiBearerAuth()
@ApiTags('PdfExportFacilityDetail')
export class PdfExportFacilityDetailController extends BaseController {
    constructor(private pdfExportService: PdfExportService) {
        super();
    }

    @Get()
    @ApiOperation({ description: 'Get supplier detail pdf data' })
    @ApiQuery({ name: 'token', required: true, type: 'string' })
    getPdfReportData(@Query('token') token: string) {
        return this.pdfExportService.getPdfData(token);
    }

    @Get(':id/download')
    @UseGuards(
        ShortTokenGuard,
        PermissionGuard(
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT,
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT_IN_SUPPLIER_MANAGEMENT,
            PermissionEnum.VIEW_SUPPLIER_RISK_ASSESSMENT_IN_USER_MANAGEMENT
        )
    )
    @ApiOperation({ description: 'Export PDF of supplier detail' })
    @Header('Content-type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename="file.pdf"')
    @ApiParam({
        name: 'id',
        description: 'supplier id',
        type: 'string'
    })
    @ApiQuery({
        name: 'timezone',
        description: 'timezone',
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
        @Id() supplierId: string,
        @Res() res: Response,
        @Query() query: FacilityRiskFilterDto,
        @Query('timezone') timezone: string,
        @Query('language') language?: string
    ) {
        const file = await this.pdfExportService.generateSupplierDetailPdf(supplierId, query, timezone, language);
        Readable.from(file).pipe(res as any);
    }
}
