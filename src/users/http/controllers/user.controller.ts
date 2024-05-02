import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from '../../services/user.service';
import { BaseController } from '~core/http/controllers/base.controller';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { UserEntity } from '../../entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Connection } from 'typeorm';
import { Id, Pagination, PaginationParams, SortMultipleParams, Sorts } from '@diginexhk/nestjs-base-decorator';
import { AdminService } from '~users/services/admin.service';
import { FacilityService } from '~facilities/services/facility.service';
import { UpdateUserProfileDto } from '~users/http/dto/update-user-profile.dto';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { InviteUserDto } from '~users/http/dto/invite-user.dto';
import { AdminUpdateUserDto } from '../dto/admin/admin-update-user.dto';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { GetMeResponse } from '../response/get-me.response';
import { UserPaginationResponse } from '../response/user-pagination.response';
import { InviteUserResponse } from '../response/invite-user.response';
import { I18nHelper } from '~core/helpers/i18n.helper';
import { LOCATION_RELATIONS } from '~locations/constants/location-relations.constant';
import { PermissionGuard } from '../guards/permission.guard';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { PaginationCollection } from '@diginexhk/typeorm-helper';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController extends BaseController {
    constructor(
        private connection: Connection,
        private userService: UserService,
        private adminService: AdminService,
        private facilityService: FacilityService
    ) {
        super();
    }

    @Get('me')
    @ResponseModel(GetMeResponse)
    async user(@CurrentUser() user: UserEntity): Promise<UserEntity> {
        if (user.currentFacility) {
            await user.currentFacility.loadRelation(LOCATION_RELATIONS);
            I18nHelper.translateFacilityLocation(user.currentFacility);
        }

        user.role.uploadedSAQ = user.role.selfAssessmentUploadFiles?.length > 0;

        return user;
    }

    @Get()
    @UseGuards(PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @ResponseModel(UserPaginationResponse)
    listUsers(
        @Pagination() page: PaginationParams,
        @Sorts({
            allowedFields: ['role', 'name', 'status', 'joinedAt', 'lastLoginAt', 'createdAt'],
            default: { sortField: 'createdAt', sortDirection: 'DESC' }
        })
        sort: SortMultipleParams[],
        @CurrentUser() currentUser: UserEntity
    ): Promise<PaginationCollection<UserEntity>> {
        return this.adminService.listUsers(currentUser, page, sort);
    }

    @Put('change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    changePassword(@CurrentUser() user: UserEntity, @Body() dto: ChangePasswordDto) {
        return this.userService.changePassword(user.id, dto.newPassword, dto.oldPassword);
    }

    @Post('invite')
    @UseGuards(PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @ResponseModel(InviteUserResponse)
    @ApiOperation({ description: 'Invite a new user' })
    inviteUser(@CurrentUser() user: UserEntity, @Body() dto: InviteUserDto): Promise<UserEntity> {
        return this.connection.transaction((manager) =>
            this.adminService.withTransaction(manager).inviteUser(user, dto)
        );
    }

    @Post(':id/resend-invitation')
    @UseGuards(PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @ApiOperation({ description: 'Admin resend invitation' })
    @ApiParam({
        name: 'id',
        description: 'User id',
        type: 'string'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    resendInvitation(@CurrentUser() user: UserEntity, @Id() id: string) {
        return this.adminService.resendInvitation(user, id);
    }

    @Put('finish-guidance')
    @ApiOperation({ description: 'Finish guidance' })
    @HttpCode(HttpStatus.NO_CONTENT)
    finishGuidance(@CurrentUser() user: UserEntity) {
        return this.userService.finishGuidance(user);
    }

    @Put(':id')
    @UseGuards(PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @ApiOperation({ description: 'Admin update user' })
    @ApiParam({
        name: 'id',
        description: 'User id',
        type: 'string'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    updateUser(@CurrentUser() admin: UserEntity, @Id() id: string, @Body() dto: AdminUpdateUserDto) {
        return this.connection.transaction(async (manager) => {
            const user = await this.adminService.withTransaction(manager).updateUser(admin, id, dto.user);

            if (dto.facility) {
                await this.adminService.checkUserRole(user);
                await this.facilityService.withTransaction(manager).updateFacilityByAdmin(id, dto.facility);
                await this.userService.changeSupplierRole(user, dto.facility.roleId);
            }
        });
    }

    @Delete('me')
    @ApiOperation({ description: 'Delete me' })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteMe(@CurrentUser() currentUser: UserEntity): Promise<void> {
        return this.adminService.deleteMe(currentUser);
    }

    @Delete(':id')
    @UseGuards(PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @ApiOperation({ description: 'Delete a user' })
    @ApiParam({
        name: 'id',
        description: 'User id',
        type: 'string'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteUser(@CurrentUser() user: UserEntity, @Id() id: string) {
        return this.adminService.deleteUser(user, id);
    }

    @Put()
    @UseGuards(PermissionGuard(PermissionEnum.COMPLETE_OWN_PROFILE))
    @ApiOperation({ description: 'Update profile' })
    @AddRequestToBody()
    @HttpCode(HttpStatus.NO_CONTENT)
    updateProfile(@CurrentUser() currentUser: UserEntity, @Body() dto: UpdateUserProfileDto) {
        const { user, facility } = dto;

        return this.connection.transaction(async (manager) => {
            await this.userService.withTransaction(manager).updateUserInformation(currentUser.id, user);
            await this.facilityService.withTransaction(manager).updateFacilityInformation(currentUser, facility);
        });
    }
}
