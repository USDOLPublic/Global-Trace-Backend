import { Controller, Get, Res, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseController } from '~core/http/controllers/base.controller';
import { Response } from 'express';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';
import { ExportTemplateService } from '~export-templates/services/export-template.service';

@ApiTags('Template')
@Controller('templates')
@ApiBearerAuth()
@UseGuards(ShortTokenGuard)
export class ExportTemplateController extends BaseController {
    constructor(private exportTemplateService: ExportTemplateService) {
        super();
    }

    @Get('export-excel')
    @ApiQuery({
        name: 'shortToken',
        description: 'Short token',
        required: true,
        type: String
    })
    exportExcel(@Res() res: Response): Promise<Response> {
        return this.exportTemplateService.exportExcel(res);
    }
}
