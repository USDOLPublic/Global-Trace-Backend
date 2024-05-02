import { ForbiddenException, Injectable } from '@nestjs/common';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityPartnerService } from '~facilities/services/facility-partner.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { RoleService } from '~role-permissions/services/role.service';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class PartnerService {
    public constructor(
        private facilityPartnerService: FacilityPartnerService,
        private roleService: RoleService,
        private supplyChainService: SupplyChainService,
        private rolePermissionService: RolePermissionService
    ) {}

    async getPartnerSellers(user: UserEntity, key?: string): Promise<FacilityEntity[]> {
        if (!user?.currentFacility) {
            throw new ForbiddenException({ translate: 'error.user_not_product_role' });
        }

        const supplyChainNodes = await this.supplyChainService.find({
            where: { roleId: user.currentFacility.typeId },
            relations: ['fromRole']
        });

        if (!supplyChainNodes.length) {
            return [];
        }

        let sellerRoleIds = supplyChainNodes.map(({ fromRole }) => fromRole.id);
        const partners = await this.facilityPartnerService.getFacilityPartnersByTypeIds(
            user.currentFacility,
            sellerRoleIds,
            key
        );
        const hasPermission = await this.rolePermissionService.hasPermission(
            user,
            PermissionEnum.ALLOW_PURCHASE_INTERMEDIARIES
        );
        if (!hasPermission) {
            return partners;
        }

        return this.concatBrokerPartners(user, sellerRoleIds, partners, key);
    }

    async getPartnerPurchasers(user: UserEntity, key?: string): Promise<FacilityEntity[]> {
        if (!user?.currentFacility) {
            throw new ForbiddenException({ translate: 'error.user_not_product_role' });
        }

        const supplyChainNodes = await this.supplyChainService.find({
            where: { fromRoleId: user.currentFacility.typeId }
        });

        if (!supplyChainNodes.length) {
            return [];
        }

        const purchaserRoleIds = supplyChainNodes.map(({ roleId }) => roleId);

        const partners = await this.facilityPartnerService.getFacilityPartnersByTypeIds(
            user.currentFacility,
            purchaserRoleIds,
            key
        );
        const hasPermission = await this.rolePermissionService.hasPermission(
            user,
            PermissionEnum.ALLOW_SALE_INTERMEDIARIES
        );
        if (!hasPermission) {
            return partners;
        }

        return this.concatBrokerPartners(user, purchaserRoleIds, partners, key);
    }

    async getPartnerTransporters(user: UserEntity): Promise<FacilityEntity[]> {
        return this.getCurrentPartnersByRole(user.currentFacility, UserRoleEnum.TRANSPORTER);
    }

    private async getCurrentPartnersByRole(
        currentFacility: FacilityEntity,
        userRole: UserRoleEnum,
        key?: string
    ): Promise<FacilityEntity[]> {
        const roleBroker = await this.roleService.findRoleByName(userRole);
        return this.facilityPartnerService.getFacilityPartnersByTypeIds(currentFacility, [roleBroker.id], key);
    }

    private async concatBrokerPartners(
        user: UserEntity,
        partnerRoleIds: string[],
        partners: FacilityEntity[],
        key?: string
    ): Promise<FacilityEntity[]> {
        const brokerPartners = await this.getCurrentPartnersByRole(user.currentFacility, UserRoleEnum.BROKER, key);

        const validBrokers = await this.facilityPartnerService.findBrokerPartnerByTypeIds(
            brokerPartners.map(({ id }) => id),
            partnerRoleIds
        );
        const validBrokerIds = validBrokers.map(({ facilityId }) => facilityId);

        const brokers = brokerPartners.filter(({ id }) => validBrokerIds.includes(id));

        return partners.concat(brokers);
    }
}
