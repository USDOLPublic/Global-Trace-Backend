import { Injectable } from '@nestjs/common';
import { groupBy, pick } from 'lodash';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { getFacilityTypeName } from '~facilities/helpers/get-facility-type-name.helper';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { SupplierMapElementType } from '~facilities/types/supplier-map-element.type';
import { TracingSupplierMapsType } from '~facilities/types/tracing-supplier-maps.type';
import { TypeMapElementType } from '~facilities/types/type-map-element.type';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class SupplierMappingService {
    constructor(private facilityRepo: FacilityRepository, private supplyChainService: SupplyChainService) {}

    async getMappingList(user: UserEntity): Promise<TypeMapElementType[][]> {
        const allSuppliers = await this.facilityRepo.findBrandSuppliers(user.currentFacility);
        const allSuppliersMap = new Map(
            allSuppliers.map((facility) => {
                return [facility.id, facility];
            })
        );

        const tracedSupplierMap = new Map();

        const rolesOrder = await this.supplyChainService.getRolesOrder();

        return this.traceFromSuppliers({ allSuppliersMap, tracedSupplierMap }, rolesOrder);
    }

    private traceFromSuppliers(
        maps: TracingSupplierMapsType,
        rolesOrder: { [key: string]: number }
    ): TypeMapElementType[][] {
        const ids = Array.from(maps.allSuppliersMap.keys());

        const result: TypeMapElementType[][] = [];
        while (true) {
            const remainingIds = ids.filter((id) => !maps.tracedSupplierMap.has(id));
            if (!remainingIds.length) {
                break;
            }

            const supplier = maps.allSuppliersMap.get(remainingIds[0]);
            result.push(this.traceGroup(supplier, maps, rolesOrder));
        }
        return result;
    }

    private traceGroup(
        supplier: FacilityEntity,
        maps: TracingSupplierMapsType,
        rolesOrder: { [key: string]: number }
    ): TypeMapElementType[] {
        const suppliers = this.traceGroupSuppliers(supplier, maps);
        const groupSuppliers = groupBy(suppliers, ({ type }) => type.name);

        return Object.entries(groupSuppliers)
            .map(([type, groupSupplier]) => {
                return {
                    type,
                    roleId: groupSupplier[0].typeId,
                    suppliers: groupSupplier.map(
                        (facility) =>
                            ({
                                ...pick(facility, [
                                    'id',
                                    'name',
                                    'selfAssessment',
                                    'users',
                                    'riskLevel',
                                    'typeId',
                                    'businessRegisterNumber',
                                    'oarId',
                                    'facilityPartners',
                                    'riskData'
                                ]),
                                label: getFacilityTypeName(facility.typeName, facility.type),
                                targets: facility.facilityPartners.map(({ partnerId }) => partnerId),
                                type: facility.typeName
                            } as SupplierMapElementType)
                    )
                };
            })
            .sort((a, b) => rolesOrder[a.roleId] - rolesOrder[b.roleId]);
    }

    private traceGroupSuppliers(supplier: FacilityEntity, maps: TracingSupplierMapsType): FacilityEntity[] {
        const supplierMap = new Map();

        this.addSuppliers(supplier, supplierMap, maps);

        return Array.from(supplierMap.values());
    }

    private addSuppliers(
        supplier: FacilityEntity,
        supplierMap: Map<string, FacilityEntity>,
        maps: TracingSupplierMapsType
    ) {
        if (!supplier || supplierMap.has(supplier.id)) {
            return;
        }

        supplierMap.set(supplier.id, supplier);

        if (!maps.tracedSupplierMap.has(supplier.id)) {
            maps.tracedSupplierMap.set(supplier.id, supplier);
        }

        for (const partner of supplier.facilityPartners) {
            this.addSuppliers(maps.allSuppliersMap.get(partner.partnerId), supplierMap, maps);
        }

        for (const partner of supplier.partnerFacilities) {
            this.addSuppliers(maps.allSuppliersMap.get(partner.facilityId), supplierMap, maps);
        }
    }
}
