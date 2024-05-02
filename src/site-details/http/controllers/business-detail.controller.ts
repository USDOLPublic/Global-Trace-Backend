import { ResponseModel } from '@diginexhk/nestjs-response';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '~core/http/controllers/base.controller';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { BusinessDetailEntity } from '~site-details/entities/business-detail.entity';
import { BusinessDetailService } from '~site-details/services/business-detail.service';
import { IMAGE_UPLOAD_OPTIONS } from '~uploads/constants/upload.constant';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { UpdateBusinessDetailDto } from '../dto/update-business-detail.dto';
import { BusinessDetailResponse } from '../response/business-detail.response';
import { CommoditiesResponse } from '../response/commodity.response';
import { Sort, SortParams } from '@diginexhk/nestjs-base-decorator';
import { orderBy } from 'lodash';

@Controller('business-details')
@ApiTags('Business Detail')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BusinessDetailController extends BaseController {
    constructor(private businessDetailService: BusinessDetailService) {
        super();
    }

    @Get()
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ResponseModel(BusinessDetailResponse)
    @ApiOperation({ description: 'Get business detail' })
    getBusinessDetail(): Promise<BusinessDetailEntity> {
        return this.businessDetailService.getBusinessDetail();
    }

    @Put()
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiOperation({ description: 'Update business detail' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('logo', IMAGE_UPLOAD_OPTIONS))
    @HttpCode(HttpStatus.NO_CONTENT)
    updateBusinessDetail(@Body() dto: UpdateBusinessDetailDto, @UploadedFile() logo?: Express.Multer.File) {
        return this.businessDetailService.updateBusinessDetail(dto, logo);
    }

    @Get('commodities')
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ResponseModel(CommoditiesResponse, true)
    @ApiOperation({ description: 'Get commodities' })
    getCommodities(
        @Sort({
            allowedFields: ['commodity'],
            default: { sortField: 'commodity', sortDirection: 'ASC' }
        })
        sort: SortParams
    ) {
        const commodities = this.businessDetailService.getCommodities();
        return orderBy(commodities, sort.sortField, sort.sortDirection === 'ASC' ? 'asc' : 'desc');
    }

    @Get('selected-commodities')
    @ApiOperation({ description: 'Get list of goods for product roles' })
    getSelectedCommodities(): Promise<string[]> {
        return this.businessDetailService.getSelectedCommodities();
    }

    @Post('configuration-systems')
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ description: 'Complete configuring system' })
    completeConfiguringSystem(): Promise<void> {
        return this.businessDetailService.completeConfiguringSystem();
    }
}
