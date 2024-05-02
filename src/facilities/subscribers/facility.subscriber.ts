import { Connection, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityPartnerRepository } from '~facilities/repositories/facility-partner.repository';
import { RoleRepository } from '~role-permissions/repositories/role.repository';

@EventSubscriber()
export class FacilitySubscriber implements EntitySubscriberInterface<FacilityEntity> {
    constructor(
        connection: Connection,
        private facilityPartnerRepo: FacilityPartnerRepository,
        private roleRepo: RoleRepository
    ) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return FacilityEntity;
    }

    async afterUpdate(event: UpdateEvent<FacilityEntity>) {
        if (!event.entity || !event.entity.type) {
            return;
        }

        await this.facilityPartnerRepo.updateFacilityType(event.entity.id, event.entity.type.id);
    }
}
