import { Injectable } from '@nestjs/common';
import { difference } from 'lodash';
import { In } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityItemRepository } from '~events/repositories/facility-item.repository';
import { ProductEntity } from '~products/entities/product.entity';

@Injectable()
export class FacilityItemService {
    constructor(private facilityItemRepo: FacilityItemRepository) {}

    createOne(facility: FacilityEntity, entity: ProductEntity) {
        return this.facilityItemRepo.createOne({
            facility,
            entityId: entity.id
        });
    }

    createMany(facility: FacilityEntity, entities: ProductEntity[]) {
        const facilityItems = entities.map((entity) =>
            this.facilityItemRepo.create({
                facility,
                entityId: entity.id
            })
        );
        return this.facilityItemRepo.save(facilityItems);
    }

    async addItemsToFacility(facility: FacilityEntity, entities: ProductEntity[]) {
        const entityIds = entities.map(({ id }) => id);

        const existingEntities = await this.facilityItemRepo.findBy({
            entityId: In(entityIds),
            facilityId: facility.id
        });
        const existingEntityIds = existingEntities.map(({ entityId }) => entityId);

        const addEntityIds = difference(entityIds, existingEntityIds);

        const facilityItems = addEntityIds.map((entityId) => this.facilityItemRepo.create({ facility, entityId }));
        return this.facilityItemRepo.save(facilityItems);
    }

    isProductBelongToFacility(facility: FacilityEntity, product: ProductEntity): Promise<boolean> {
        return this.facilityItemRepo.exist({ where: { facilityId: facility.id, entityId: product.id } });
    }
}
