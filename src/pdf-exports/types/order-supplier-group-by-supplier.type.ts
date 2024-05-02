import { TracingSupplierType } from '~order/types/tracing-supplier.type';

export type OrderSupplierGroupBySupplier = {
    [id: string]: TracingSupplierType[];
};
