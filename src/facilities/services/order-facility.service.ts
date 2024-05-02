import { Injectable, NotFoundException } from '@nestjs/common';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { AdminGetAndSearchSupplierQuery } from '~facilities/queries/admin-get-search-supplier.query';
import { BrandGetAndSearchSupplierQuery } from '~facilities/queries/brand-get-and-search-supplier.query';
import { GetAndSearchPartnerSupplierQuery } from '~facilities/queries/get-and-search-partner-supplier.query';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { FacilityPartnerService } from './facility-partner.service';

@Injectable()
export class OrderFacilityService {
    constructor(
        private facilityRepo: FacilityRepository,
        private roleService: RoleService,
        private supplyChainService: SupplyChainService,
        private facilityPartnerService: FacilityPartnerService
    ) {}

    async findSupplierForOrder(user: UserEntity, supplierId: string) {
        const suppliers = await this.getListOfSuppliers(user);
        const supplier = suppliers.find(({ id }) => id === supplierId);
        if (!supplier) {
            throw new NotFoundException({ translate: 'error.not_found.FacilityEntity' });
        }
        return supplier;
    }

    async findSupplierForOrderSupplier(user: UserEntity, parentId: string, supplierId: string) {
        const suppliers = await this.listPartnerSuppliers(user, parentId);
        return suppliers.find(({ id }) => id === supplierId);
    }

    async getListOfSuppliers(user: UserEntity, key?: string): Promise<FacilityEntity[]> {
        switch (user.role.type) {
            case RoleTypeEnum.BRAND:
                return this.facilityRepo.find(new BrandGetAndSearchSupplierQuery(user.currentFacility.id, key));
            case RoleTypeEnum.ADMINISTRATOR:
                const roleIds = await this.roleService.getSupplierRoleIds();
                return this.facilityRepo.find(new AdminGetAndSearchSupplierQuery(roleIds, key));
            case RoleTypeEnum.PRODUCT:
                return [user.currentFacility];
            default:
                return [];
        }
    }

    async listPartnerSuppliers(user: UserEntity, supplierId: string, key?: string): Promise<FacilityEntity[]> {
        const supplier = await this.facilityRepo.findById(supplierId);
        const supplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({ roleId: supplier.typeId });

        if (!supplyChainNode || !supplyChainNode.fromRoleId) {
            return [];
        }

        switch (user.role.type) {
            case RoleTypeEnum.BRAND:
                return this.facilityRepo.find(
                    new GetAndSearchPartnerSupplierQuery(
                        user.currentFacility.id,
                        supplierId,
                        supplyChainNode.fromRoleId,
                        key
                    )
                );
            case RoleTypeEnum.ADMINISTRATOR:
                return this.facilityRepo.find(new AdminGetAndSearchSupplierQuery([supplyChainNode.fromRoleId], key));
            case RoleTypeEnum.PRODUCT:
                const broker = await this.roleService.findRoleByName(UserRoleEnum.BROKER);
                const partners = await this.facilityRepo.getSupplierPartnersByTypeIds(
                    supplier,
                    [supplyChainNode.fromRoleId, broker.id],
                    key
                );
                const validBrokers = await this.facilityPartnerService.findBrokerPartnerByTypeIds(
                    partners.filter(({ typeId }) => broker.id).map(({ id }) => id),
                    [supplyChainNode.fromRoleId]
                );
                const validBrokerIds = validBrokers.map(({ facilityId }) => facilityId);
                return partners.filter(
                    ({ id, typeId }) => supplyChainNode.fromRoleId === typeId || validBrokerIds.includes(id)
                );
            default:
                return [];
        }
    }
}
