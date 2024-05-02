import { MappingSupplierType } from '~order/types/mapping-supplier.type';
import { TracingSupplierType } from '~order/types/tracing-supplier.type';

export type SupplierMappingData = {
    traceResultList: TracingSupplierType[];
    traceMappingSuppliers: MappingSupplierType[];
    orderSuppliers: MappingSupplierType[];
};
