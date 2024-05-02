import { Id, Pagination, PaginationParams, QueryBoolean } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { BusinessPartnerService } from '~business-partners/services/business-partner.service';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityWithUsersResponse } from '~facilities/http/response/facility-with-users.response';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleResponse } from '~role-permissions/http/response/role.response';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { GetAllBusinessPartnerResponse } from '~users/http/response/get-all-business-partner.response';
import { InviteProductPartnerDto } from '../dto/invite-product-partner.dto';

@Controller('partners')
@ApiTags('Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.INVITE_PARTNERS))
export class PartnerController extends BaseController {
    constructor(private connection: Connection, private partnerService: BusinessPartnerService) {
        super();
    }

    @Get('roles')
    @ApiOperation({ description: 'Get invite roles' })
    @ResponseModel(RoleResponse, true)
    getInviteRoles(
        @CurrentUser() user: UserEntity,
        @QueryBoolean('canInvite') canInvite: boolean
    ): Promise<RoleEntity[]> {
        return this.partnerService.getInviteRoles(user, canInvite);
    }

    @Get('search/facilities')
    @ApiOperation({ description: 'Search exiting facilities' })
    @ApiQuery({ name: 'key', required: false, type: String })
    @ResponseModel(FacilityWithUsersResponse, true)
    searchExitingFacilities(@CurrentUser() user: UserEntity, @Query('key') key: string): Promise<FacilityEntity[]> {
        return this.partnerService.searchExitingFacilities(user, key);
    }

    @Post('invite')
    @ApiOperation({ description: 'Invite business facilities' })
    @AddRequestToBody()
    inviteBusinessPartner(@CurrentUser() user: UserEntity, @Body() dto: InviteProductPartnerDto) {
        return this.connection.transaction(
            async (manager) =>
                (await this.partnerService.withTransaction(manager).inviteBusinessPartner(user, dto)) ?? {}
        );
    }

    @Get('all')
    @ResponseModel(GetAllBusinessPartnerResponse, true)
    @ApiOperation({ description: 'List all business partners' })
    getAllBusinessPartners(@CurrentUser() currentUser: UserEntity): Promise<FacilityEntity[]> {
        return this.partnerService.getAllBusinessPartners(currentUser);
    }

    @Get()
    @ApiOperation({ description: 'List business partners with pagination' })
    getBusinessPartners(
        @CurrentUser() currentUser: UserEntity,
        @Pagination() pagination: PaginationParams
    ): Promise<PaginationCollection<FacilityEntity>> {
        return this.partnerService.getPartnersWithPagination(currentUser, pagination);
    }

    @Delete(':partnerId')
    @ApiOperation({ description: 'Delete partner' })
    @ApiParam({ name: 'partnerId', description: 'Partner id', type: 'string' })
    @HttpCode(HttpStatus.NO_CONTENT)
    deletePartner(@CurrentUser() user: UserEntity, @Id('partnerId') partnerId: string) {
        return this.partnerService.deletePartner(user, partnerId);
    }
}
