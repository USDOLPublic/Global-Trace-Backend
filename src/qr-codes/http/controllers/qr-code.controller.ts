import { ResponseModel } from '@diginexhk/nestjs-response';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BaseController } from '~core/http/controllers/base.controller';
import { QrCodeService } from '~qr-codes/services/qr-code.service';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { QrCodeResponse } from '../response/qr-code.response';

@Controller('qr-codes')
@ApiTags('QrCode')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class QrCodeController extends BaseController {
    constructor(private qrCodeService: QrCodeService) {
        super();
    }

    @Get()
    @ApiOperation({ description: 'Get list of available QR codes' })
    getAvailableQrCodes(): Promise<string[]> {
        return this.qrCodeService.getAvailableQrCodes();
    }

    @Get(':code')
    @ResponseModel(QrCodeResponse)
    @ApiOperation({ description: 'Check valid QR code' })
    @ApiParam({ name: 'code', description: 'QR code', required: true })
    getEncodedQrCode(@Param('code') code: string) {
        return this.qrCodeService.getEncodedQrCode(code);
    }
}
