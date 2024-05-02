import { FacilityEntity } from '~facilities/entities/facility.entity';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { TracingCategoryEnum } from '~order/enums/tracing-category.enum';
import { RoleEntity } from '~role-permissions/entities/role.entity';

export type TracingSupplierType = {
    supplier?: FacilityEntity;
    role: RoleEntity;
    orderSupplierId: string;
    category: TracingCategoryEnum;
    transactionInfo?: {
        purchaseOrderNumber?: string;
        purchasedAt: number | Date;
        invoiceNumber?: string;
        packingListNumber?: string;
    };
    productIds?: string[];
    fromSupplierId?: string;
    parentId?: string;
    isRoot: boolean;
    transactionId?: string;
    transactionType?: TransactionTypeEnum;
    transactedAt: Date | number;
    tracedPurchasedAtLevel?: number;
    tracedPurchasedAt?: Date | number;
    transactions?: TransactionEntity[];
    document?: {
        transactionIds: string[];
        hasProof: boolean;
        hasInvoice: boolean;
        hasPackingList: boolean;
        hasCertification: boolean;
    };
    orderSupplierTypeId?: string;
};
