import { UserEntity } from '~users/entities/user.entity';
import { EventOfFacilityEnum } from '~events/enums/event-of-facility.enum';

export type EventType<D, F> = {
    user: UserEntity;
    data: D;
    uploadProofs: F;
    eventType: EventOfFacilityEnum;
};
