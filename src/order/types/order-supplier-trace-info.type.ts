import { AddOrderSupplierType } from './add-order-supplier.type';

export type OrderSupplierTraceInfoType = Pick<
    AddOrderSupplierType,
    'purchaseOrderNumber' | 'purchasedAt' | 'invoiceNumber' | 'packingListNumber'
>;
