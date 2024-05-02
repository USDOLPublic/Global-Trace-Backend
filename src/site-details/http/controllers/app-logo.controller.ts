import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '~core/http/controllers/base.controller';
import { FileUploadType } from '~core/types/file-upload.type';
import { BusinessDetailService } from '~site-details/services/business-detail.service';

@Controller('app-logo')
@ApiTags('AppLogo')
export class AppLogoController extends BaseController {
    constructor(private businessDetailService: BusinessDetailService) {
        super();
    }

    @Get()
    @ApiOperation({ description: 'Get logo business' })
    getAppLogo(): Promise<FileUploadType> {
        return this.businessDetailService.getAppLogo();
    }
}
