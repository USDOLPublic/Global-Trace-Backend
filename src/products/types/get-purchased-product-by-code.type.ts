import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { UserEntity } from '~users/entities/user.entity';

export type GetPurchasedProductByCode = {
    currentUser: UserEntity;
    code: string;
    checkOwnFacility?: boolean;
    transactionType: TransactionTypeEnum;
};
