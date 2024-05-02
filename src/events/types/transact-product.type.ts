import { TransactionEntity } from '~events/entities/transaction.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { UserEntity } from '~users/entities/user.entity';

export type TransactProductType = {
    fromFacility: FacilityEntity;
    toFacility: FacilityEntity;
    transactionData: Partial<TransactionEntity>;
    entityIds: string[];
    user: UserEntity;
};
