import { Id } from '@diginexhk/nestjs-base-decorator';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { QueryBoolean } from '~core/decorators/query-boolean.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { QrCodeBatchService } from '~qr-codes/services/qr-code-batch.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';

@Controller('qr-code-batchs')
@ApiTags('QrCode')
@UseGuards(ShortTokenGuard)
@UseGuards(ShortTokenGuard, PermissionGuard(PermissionEnum.GENERATE_QR_CODES))
export class DownloadQrCodeBatchController extends BaseController {
    constructor(private qrCodeBatchService: QrCodeBatchService) {
        super();
    }

    @Get(':id/download')
    @ApiOperation({ description: 'Download qr code batch' })
    @ApiParam({
        name: 'id',
        description: 'QR code batch Id'
    })
    @ApiQuery({
        name: 'isAssigned',
        description: 'Specify whether download qr codes that were assigned or not',
        required: false,
        type: Boolean
    })
    @ApiQuery({
        name: 'shortToken',
        description: 'short token',
        required: true,
        type: String
    })
    downloadQrCodeBatch(
        @Id() id: string,
        @Res() res: Response,
        @QueryBoolean('isAssigned') isAssigned: boolean = false
    ) {
        return this.qrCodeBatchService.downloadQrCodeBatch(id, isAssigned, res);
    }
}
