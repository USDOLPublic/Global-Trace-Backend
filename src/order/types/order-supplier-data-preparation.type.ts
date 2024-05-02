import { UserEntity } from '~users/entities/user.entity';
import { AddOrderSupplierType } from '~order/types/add-order-supplier.type';

export type OrderSupplierDataPreparationType = {
    user: UserEntity;
    orderId: string;
    data: AddOrderSupplierType;
};
