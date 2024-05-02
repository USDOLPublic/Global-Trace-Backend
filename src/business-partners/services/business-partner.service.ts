import { PaginationParams } from '@diginexhk/nestjs-base-decorator';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { InviteProductPartnerDto } from '~business-partners/http/dto/invite-product-partner.dto';
import { generatePaginateCollection } from '~core/helpers/object-helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityPartnerService } from '~facilities/services/facility-partner.service';
import { FacilityService } from '~facilities/services/facility.service';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { ActorService } from '~users/services/actor.service';
import { UserService } from '~users/services/user.service';

@Injectable()
export class BusinessPartnerService extends TransactionService {
    constructor(
        private supplyChainService: SupplyChainService,
        private roleService: RoleService,
        private facilityService: FacilityService,
        private actorService: ActorService,
        private userService: UserService,
        private facilityPartnerService: FacilityPartnerService
    ) {
        super();
    }

    async searchExitingFacilities(user: UserEntity, key?: string): Promise<FacilityEntity[]> {
        const partnerRoleIds = await this.supplyChainService.getPartnerRoleIds(user.roleId);
        return this.facilityService.searchExitingFacilities({
            partnerRoleIds,
            ownerFacility: user.currentFacility,
            key,
            isExcludeAddedPartners: true
        });
    }

    async getInviteRoles(user: UserEntity, canInvite: boolean): Promise<RoleEntity[]> {
        const partnerRoleIds = await this.supplyChainService.getPartnerRoleIds(user.roleId);

        if (isEmpty(partnerRoleIds)) {
            return [];
        }

        if (canInvite) {
            return this.roleService.getRolesHavePermission(PermissionEnum.COMPLETE_OWN_PROFILE, partnerRoleIds);
        }
        return this.roleService.findRolesByIds(partnerRoleIds);
    }

    async inviteBusinessPartner(user: UserEntity, dto: InviteProductPartnerDto): Promise<UserEntity> {
        const { facilityId, userInformation, facilityInformation } = dto;

        let facility: FacilityEntity;
        let contactor: UserEntity;

        if (facilityId) {
            facility = await this.facilityService.findById(facilityId, {
                relations: ['users', 'users.role', 'users.permissions', 'type']
            });
            await this.checkPartnerValidRole(user, facility.typeId);
            contactor = facility.users[0];
        } else {
            await this.checkPartnerValidRole(user, facilityInformation.roleId);
            const role = await this.roleService.findRoleById(facilityInformation.roleId);
            facility = await this.facilityService.createOne({
                ...facilityInformation,
                typeId: facilityInformation.roleId,
                chainOfCustody: role.chainOfCustody
            });
            contactor = await this.actorService.createFacilityContactor(user, role, userInformation, facility);
            await this.userService.sendInvitationMail(user, contactor);
        }

        await this.facilityPartnerService.addFacilityPartner({
            ownerFacility: user.currentFacility,
            baseFacility: user.currentFacility,
            facilityPartner: facility,
            creatorId: user.id
        });

        await this.actorService.saveUserLastAddedPartnerAt(user);
        return contactor;
    }

    private async checkPartnerValidRole(user: UserEntity, partnerRoleId: string) {
        const roleIds = await this.supplyChainService.getPartnerRoleIds(user.roleId);
        if (!roleIds.includes(partnerRoleId)) {
            throw new BadRequestException({ translate: 'validation.can_not_invite_this_role' });
        }
    }

    async getAllBusinessPartners(user: UserEntity): Promise<FacilityEntity[]> {
        const partnerRoleIds = await this.supplyChainService.getPartnerRoleIds(user.roleId);
        const brokerAndTransporter = await this.getBrokerAndTransporterRole();
        partnerRoleIds.push(...brokerAndTransporter.map(({ id }) => id));

        if (isEmpty(partnerRoleIds)) {
            return [];
        }
        return this.facilityPartnerService.getFacilityPartnersByTypeIds(user.currentFacility, partnerRoleIds);
    }

    async getPartnersWithPagination(
        user: UserEntity,
        pagination: PaginationParams
    ): Promise<PaginationCollection<FacilityEntity>> {
        const partnerRoleIds = await this.supplyChainService.getPartnerRoleIds(user.roleId);
        const brokerAndTransporter = await this.getBrokerAndTransporterRole();
        partnerRoleIds.push(...brokerAndTransporter.map(({ id }) => id));

        if (isEmpty(partnerRoleIds)) {
            return generatePaginateCollection(pagination);
        }
        return this.facilityPartnerService.paginateBusinessPartners(user.currentFacility, partnerRoleIds, pagination);
    }

    async deletePartner(user: UserEntity, partnerId: string): Promise<void> {
        await this.facilityPartnerService.deleteBusinessPartner(user, partnerId);
    }

    private getBrokerAndTransporterRole() {
        return Promise.all([
            this.roleService.findRoleByName(UserRoleEnum.BROKER),
            this.roleService.findRoleByName(UserRoleEnum.TRANSPORTER)
        ]);
    }
}
