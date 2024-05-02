export type AddOrderSupplierType = {
    supplierId: string;
    parentId?: string;
    fromSupplierId?: string;
    purchaseOrderNumber?: string;
    purchasedAt?: number;
    invoiceNumber?: string;
    packingListNumber?: string;
};
