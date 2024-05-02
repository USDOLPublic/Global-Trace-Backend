import { Queue } from 'typescript-collections';
import { TracingSupplierType } from '~order/types/tracing-supplier.type';

export type ItemTraceResultType = {
    traceResults: TracingSupplierType[];
    transactionIds: string[];
    tracingObjects: TracingSupplierType[];
    parentIds: string[];
    queue: Queue<TracingSupplierType>;
};
