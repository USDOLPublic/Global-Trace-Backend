import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { TransporterPartnerService } from '~business-partners/services/transporter-partner.service';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityWithUsersResponse } from '~facilities/http/response/facility-with-users.response';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { InviteTransporterPartnerDto } from '../dto/invite-transporter-partner.dto';
import { PartnerResponse } from '../response/partner.response';

@Controller('partners')
@ApiTags('Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TransporterController extends BaseController {
    constructor(private connection: Connection, private transporterPartnerService: TransporterPartnerService) {
        super();
    }

    @Post('invite/transporters')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(PartnerResponse, false, true)
    @ApiOperation({ description: 'Invite transporter partner' })
    @AddRequestToBody()
    inviteTransporterPartner(
        @CurrentUser() user: UserEntity,
        @Body() dto: InviteTransporterPartnerDto
    ): Promise<UserEntity> {
        return this.connection.transaction((manager) =>
            this.transporterPartnerService.withTransaction(manager).inviteTransporterPartner(user, dto)
        );
    }

    @Get('search/transporters')
    @UseGuards(PermissionGuard(PermissionEnum.INVITE_PARTNERS))
    @ResponseModel(FacilityWithUsersResponse, true)
    @ApiOperation({ description: 'Search exiting transporters' })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    searchExitingTransporters(@CurrentUser() user: UserEntity, @Query('key') key: string): Promise<FacilityEntity[]> {
        return this.transporterPartnerService.searchExitingTransporters(user, key);
    }
}
