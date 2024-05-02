import { Ids } from '@diginexhk/nestjs-base-decorator';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseController } from '~core/http/controllers/base.controller';
import { DocumentService } from '~order/services/document.service';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';

@Controller('orders/:id/trace')
@ApiTags('OrderTrace')
@UseGuards(ShortTokenGuard)
export class DocumentController extends BaseController {
    constructor(private documentService: DocumentService) {
        super();
    }

    @Get('download-documents')
    @ApiOperation({ description: 'Download supplier documents' })
    @ApiQuery({
        name: 'shortToken',
        description: 'short token',
        required: true,
        type: String
    })
    @ApiQuery({
        name: 'transactionIds',
        description: 'Transaction Ids',
        required: true
    })
    downloadDocuments(@Ids('transactionIds') transactionIds: string[], @Res() res: Response) {
        return this.documentService.downloadDocuments(transactionIds, res);
    }
}
