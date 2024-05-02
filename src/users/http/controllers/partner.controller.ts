import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { AddBrokerPartnerDto } from '~users/http/dto/add-broker-partner.dto';
import { PartnerService } from '~users/services/partner.service';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { UserEntity } from '../../entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { GetPartnerResponse } from '../response/get-partner.response';
import { FacilityEntity } from '~facilities/entities/facility.entity';

@Controller('partners')
@ApiTags('Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.INVITE_PARTNERS))
export class PartnerController extends BaseController {
    constructor(private partnerService: PartnerService) {
        super();
    }

    @Get('sellers')
    @ResponseModel(GetPartnerResponse, true)
    @ApiOperation({
        description: 'Get list of sellers and search brokers by their name or business registration number'
    })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    getPartnerSellers(@CurrentUser() user: UserEntity, @Query('key') key: string): Promise<FacilityEntity[]> {
        return this.partnerService.getPartnerSellers(user, key);
    }

    @Get('purchasers')
    @ResponseModel(GetPartnerResponse, true)
    @ApiOperation({
        description:
            'Get list of purchasers search brokers created by other ginners by their name or business registration number'
    })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    getPartnerPurchasers(@CurrentUser() user: UserEntity, @Query('key') key: string): Promise<FacilityEntity[]> {
        return this.partnerService.getPartnerPurchasers(user, key);
    }

    @Get('transporters')
    @ResponseModel(GetPartnerResponse, true)
    @ApiOperation({ description: 'Get list of transporters' })
    getPartnerTransporters(@CurrentUser() user: UserEntity): Promise<FacilityEntity[]> {
        return this.partnerService.getPartnerTransporters(user);
    }

    @Post()
    @ApiOperation({ description: 'Validate broker partners' })
    @AddRequestToBody()
    @HttpCode(HttpStatus.OK)
    addBrokerPartner(@Body() dto: AddBrokerPartnerDto) {
        /**/
    }
}
