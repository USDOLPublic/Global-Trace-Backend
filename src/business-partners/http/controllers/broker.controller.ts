import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { BrokerPartnerService } from '~business-partners/services/broker-partner.service';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityWithUsersResponse } from '~facilities/http/response/facility-with-users.response';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { InviteBrokerPartnerDto } from '../dto/invite-broker-partner.dto';
import { PartnerResponse } from '../response/partner.response';

@Controller('partners')
@ApiTags('Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BrokerController extends BaseController {
    constructor(private connection: Connection, private brokerPartnerService: BrokerPartnerService) {
        super();
    }

    @Post('invite/brokers')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(PartnerResponse, false, true)
    @ApiOperation({ description: 'Invite broker partner' })
    @AddRequestToBody()
    inviteBrokerPartner(@CurrentUser() user: UserEntity, @Body() dto: InviteBrokerPartnerDto): Promise<UserEntity> {
        return this.connection.transaction((manager) =>
            this.brokerPartnerService.withTransaction(manager).inviteBrokerPartner(user, dto)
        );
    }

    @Get('search/brokers')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(FacilityWithUsersResponse, true)
    @ApiOperation({ description: 'Search existing brokers' })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    searchExitingBrokers(@CurrentUser() user: UserEntity, @Query('key') key: string): Promise<FacilityEntity[]> {
        return this.brokerPartnerService.searchBrokerFacilities(user, key);
    }

    @Get('search/broker-partners')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(FacilityWithUsersResponse, true)
    @ApiOperation({ description: 'Search existing partners of broker' })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    searchBrokerPartners(@CurrentUser() user: UserEntity, @Query('key') key: string): Promise<FacilityEntity[]> {
        return this.brokerPartnerService.searchBrokerPartners(user, key);
    }
}
