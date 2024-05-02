import { PaginationParams, SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { ValidateFieldException } from '@diginexhk/nestjs-exception';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityService } from '~facilities/services/facility.service';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { UserEntity } from '~users/entities/user.entity';
import { UserStatusEnum } from '~users/enums/user-status.enum';
import { InviteUserDto } from '~users/http/dto/invite-user.dto';
import { GetAndSearchUserQuery } from '~users/queries/get-and-search-user.query';
import { UserRepository } from '~users/repositories/user.repository';
import { UserService } from './user.service';
import { Not } from 'typeorm';

@Injectable()
export class AdminService extends TransactionService {
    public constructor(
        private userRepo: UserRepository,
        private userService: UserService,
        private roleService: RoleService,
        private facilityService: FacilityService
    ) {
        super();
    }

    async listUsers(
        currentUser: UserEntity,
        paginationParams: PaginationParams,
        sortParams: SortMultipleParams[]
    ): Promise<PaginationCollection<UserEntity>> {
        const excludedRoleIds = await this.roleService.getExcludedRoles(currentUser);
        const userPagination = await this.userRepo.pagination(
            new GetAndSearchUserQuery(currentUser.id, excludedRoleIds, sortParams),
            paginationParams
        );

        return {
            ...userPagination,
            items: userPagination.items.map((user) => ({
                ...user,
                role: user.role,
                currentFacility: user.facilities[0]
            }))
        } as PaginationCollection<UserEntity>;
    }

    private checkAdminEditStatusHimSelf(admin: UserEntity, userId: string, attrs: Partial<UserEntity>) {
        if (admin.id === userId && 'status' in attrs) {
            throw new BadRequestException({ translate: 'error.not_allowed_to_edit_status_yourself' });
        }
    }

    async updateUser(admin: UserEntity, id: string, attrs: Partial<UserEntity>) {
        const user = await this.userService.findUserById(id);
        if (user.status === UserStatusEnum.INVITED) {
            throw new BadRequestException({ translate: 'error.user_is_not_onboard' });
        }

        this.checkAdminEditStatusHimSelf(admin, id, attrs);
        await this.checkIsManagedByAdmin(admin, user);

        Object.assign(user, attrs);
        return user.save();
    }

    async checkUserRole(updatedUser: UserEntity) {
        const { role } = updatedUser;
        const hasProductRole = role.type === RoleTypeEnum.PRODUCT;

        if (!hasProductRole) {
            throw new BadRequestException({ translate: 'error.user_are_not_allowed_to_update' });
        }
    }

    async deleteUser(admin: UserEntity, id: string): Promise<void> {
        if (admin.id === id) {
            throw new BadRequestException({ translate: 'error.not_allowed_to_remove_yourself' });
        }

        const user = await this.userService.findUserById(id);
        await this.checkIsManagedByAdmin(admin, user);

        user.currentFacility = await this.facilityService.findFacilityOfUser(user);
        if (user.currentFacility) {
            await this.facilityService.deleteFacilityById(user.currentFacility.id);
        }

        await user.softRemove();
    }

    async resendInvitation(admin: UserEntity, invitedUserId: string): Promise<void> {
        const invitedUser = await this.userService.findUserById(invitedUserId);
        if (invitedUser.status !== UserStatusEnum.INVITED) {
            throw new BadRequestException({ translate: 'error.user_signed_up' });
        }

        await this.checkInvitedUserRole(admin, invitedUser.role);
        await this.checkIsManagedByAdmin(admin, invitedUser);

        return this.userService.sendInvitationMail(admin, invitedUser);
    }

    private async checkIsManagedByAdmin(admin: UserEntity, user: UserEntity): Promise<void> {
        const excludedRoles = await this.roleService.getExcludedRoles(admin);

        if (excludedRoles.includes(user.roleId)) {
            throw new BadRequestException({ translate: 'error.not_managed_by_admin' });
        }
    }

    private async getFacilityInformation(role: RoleEntity, data: InviteUserDto): Promise<Partial<FacilityEntity>> {
        if (data.roleType == RoleTypeEnum.PRODUCT && !isEmpty(data.supplierInformation)) {
            return { ...data.supplierInformation, typeId: role.id, chainOfCustody: role.chainOfCustody };
        }

        if (data.roleType == RoleTypeEnum.BRAND && !isEmpty(data.brandInformation)) {
            return { ...data.brandInformation, typeId: role.id, chainOfCustody: role.chainOfCustody };
        }

        return { typeId: role.id, chainOfCustody: role.chainOfCustody };
    }

    private async checkInvitedUserRole(user: UserEntity, role: RoleEntity) {
        const canLogin = await this.roleService.canRoleLogin(role);
        const isAdminInviteSuperAdmin =
            user.role.name !== UserRoleEnum.SUPER_ADMIN && role.name === UserRoleEnum.SUPER_ADMIN;

        if (!canLogin || isAdminInviteSuperAdmin) {
            throw new ValidateFieldException('roleId', 'invalid_invited_user_role', 'invalid_invited_user_role');
        }
    }

    async inviteUser(user: UserEntity, data: InviteUserDto): Promise<UserEntity> {
        const { email, firstName, lastName, roleId } = data;
        const role = await this.roleService.findRoleById(roleId);
        await this.checkInvitedUserRole(user, role);

        const facilityInformation = await this.getFacilityInformation(role, data);
        const facility: FacilityEntity = await this.facilityService.createOne(facilityInformation);

        let invitedUser = await this.userRepo.save({
            email,
            firstName,
            lastName,
            role,
            permissions: [],
            facilities: [facility]
        });
        await this.userService.sendInvitationMail(user, invitedUser);

        return invitedUser;
    }

    async deleteMe(currentUser: UserEntity): Promise<void> {
        this.validateDeleteSuperAdmin(currentUser.role);
        this.validateDeleteAdmin(currentUser.id, currentUser.role);

        if (currentUser.currentFacility) {
            await this.facilityService.deleteFacilityById(currentUser.currentFacility.id);
        }
        await this.userRepo.softDelete({ id: currentUser.id });
    }

    private validateDeleteSuperAdmin(role: RoleEntity): void {
        if (role.name === UserRoleEnum.SUPER_ADMIN) {
            throw new BadRequestException({ translate: 'error.not_allowed_to_remove_yourself' });
        }
    }

    private async validateDeleteAdmin(adminId: string, role: RoleEntity) {
        if (role.type !== RoleTypeEnum.ADMINISTRATOR) {
            return;
        }

        const countAdmins = await this.userRepo.count({
            where: {
                id: Not(adminId),
                role: { type: RoleTypeEnum.ADMINISTRATOR, name: Not(UserRoleEnum.SUPER_ADMIN) }
            }
        });

        if (!countAdmins) {
            throw new BadRequestException({ translate: 'error.at_least_one_admin' });
        }
    }
}
