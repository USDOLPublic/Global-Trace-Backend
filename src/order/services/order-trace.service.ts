import { SortParams } from '@diginexhk/nestjs-base-decorator';
import { Injectable } from '@nestjs/common';
import { concat, groupBy, isEmpty, uniq } from 'lodash';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { TransactionHistoryService } from '~events/services/transaction/transaction-history.service';
import { NON_PARTICIPATING } from '~facilities/constants/facility-type-name.constant';
import { getFacilityTypeName } from '~facilities/helpers/get-facility-type-name.helper';
import { OrderSupplierEntity } from '~order/entities/order-supplier.entity';
import { TracingCategoryEnum } from '~order/enums/tracing-category.enum';
import { MappingSupplierType } from '~order/types/mapping-supplier.type';
import { TracingSupplierType } from '~order/types/tracing-supplier.type';
import { UserEntity } from '~users/entities/user.entity';
import { OrderSupplierService } from './order-supplier.service';
import { TraceService } from './trace.service';
import { TracingUtilityService } from './tracing-utility.service';

@Injectable()
export class OrderTraceService {
    constructor(
        private orderSupplierService: OrderSupplierService,
        private traceService: TraceService,
        private transactionHistoryService: TransactionHistoryService,
        private tracingUtilityService: TracingUtilityService
    ) {}

    async getSupplierList(user: UserEntity, orderId: string): Promise<MappingSupplierType[]> {
        const orderSuppliers: OrderSupplierEntity[] = await this.orderSupplierService.getOrderSuppliers(user, orderId);
        const tracingObjects: TracingSupplierType[] = orderSuppliers.map((orderSupplier) =>
            this.tracingUtilityService.convertToTracingObject(orderSupplier)
        );

        return this.tracingUtilityService.convertMappingSuppliers(tracingObjects);
    }

    async getTraceResultMapping(user: UserEntity, orderId: string): Promise<MappingSupplierType[]> {
        const tracingObjects = await this.traceService.getTraceOrderResult(user, orderId);
        const mappingSuppliers = tracingObjects.filter(
            ({ category }) => category === TracingCategoryEnum.SUPPLIER_MAPPING
        );
        let tracedSuppliers: TracingSupplierType[] = tracingObjects.filter(
            ({ category }) => category === TracingCategoryEnum.TRACED
        );
        const brokerPartners = await this.traceService.getBrokerPartners(tracedSuppliers);
        tracedSuppliers = tracedSuppliers.concat(brokerPartners);

        return concat(
            this.tracingUtilityService.convertMappingSuppliers(mappingSuppliers),
            this.groupBySupplier(mappingSuppliers, tracedSuppliers)
        );
    }

    private groupBySupplier(
        mappingSuppliers: TracingSupplierType[],
        tracedSuppliers: TracingSupplierType[]
    ): MappingSupplierType[] {
        const supplierGroups = groupBy(tracedSuppliers, ({ supplier }) => supplier?.id);

        const orderSupplierIdMap = {};
        for (const tracingObject of mappingSuppliers) {
            orderSupplierIdMap[tracingObject.orderSupplierId] = tracingObject.orderSupplierId;
        }

        Object.entries(supplierGroups).forEach(([, supplierGroup]) => {
            for (const tracingObject of supplierGroup) {
                orderSupplierIdMap[tracingObject.orderSupplierId] = supplierGroup[0].orderSupplierId;
            }
        });

        return Object.entries(supplierGroups).map(([, supplierGroup]) => {
            const targets = uniq(
                supplierGroup.filter(({ parentId }) => parentId).map(({ parentId }) => orderSupplierIdMap[parentId])
            );

            return {
                ...supplierGroup[0].supplier,
                orderSupplierId: supplierGroup[0].orderSupplierId,
                isRoot: supplierGroup[0].isRoot,
                label: getFacilityTypeName(supplierGroup[0].supplier?.typeName, supplierGroup[0].role),
                targets,
                document: supplierGroup[0].document
            };
        });
    }

    async getTraceResultList(
        user: UserEntity,
        orderId: string,
        sort: SortParams = { sortField: 'transactedAt', sortDirection: 'DESC' }
    ): Promise<TracingSupplierType[]> {
        const tracingObjects = await this.traceService.getTraceOrderResult(user, orderId);

        await this.addDocuments(tracingObjects);
        const result = tracingObjects.filter(
            (tracingObject) =>
                !tracingObject.transactionType || tracingObject.transactionType === TransactionTypeEnum.PURCHASE
        );

        return this.sortTraceResult(result, sort);
    }

    private sortTraceResult(result: TracingSupplierType[], sort: SortParams): TracingSupplierType[] {
        return result.sort((a, b) => {
            const referenceStr =
                sort.sortField === 'supplierName'
                    ? a.supplier?.name ?? `${NON_PARTICIPATING} ${a.role.name}`
                    : a[sort.sortField];
            const compareStr =
                sort.sortField === 'supplierName'
                    ? b.supplier?.name ?? `${NON_PARTICIPATING} ${b.role.name}`
                    : b[sort.sortField];
            if (sort.sortField === 'transactedAt') {
                return sort.sortDirection === 'ASC' ? referenceStr - compareStr : compareStr - referenceStr;
            }
            return sort.sortDirection === 'ASC'
                ? referenceStr.localeCompare(compareStr)
                : compareStr.localeCompare(referenceStr);
        });
    }

    async getTracingObjectList(
        user: UserEntity,
        orderId: string,
        sort: SortParams = { sortField: 'transactedAt', sortDirection: 'DESC' }
    ): Promise<TracingSupplierType[]> {
        const tracingObjects = await this.traceService.getTraceOrderResult(user, orderId);
        return this.sortTraceResult(tracingObjects, sort);
    }

    private async addDocuments(tracingObjects: TracingSupplierType[]) {
        const transactionIds = tracingObjects
            .map(({ transactionId }) => transactionId)
            .filter((transactionId) => transactionId);
        const transactions = await this.transactionHistoryService.getRawTransactionsByIds(transactionIds);

        for (const tracingObject of tracingObjects) {
            if (!tracingObject.supplier || tracingObject.category != TracingCategoryEnum.TRACED) {
                continue;
            }

            const filterTransactions = transactions.filter(
                ({ fromFacilityId, productId }) =>
                    tracingObject.supplier.id == fromFacilityId && tracingObject.productIds.includes(productId)
            );
            if (filterTransactions.length) {
                tracingObject.document = {
                    transactionIds: uniq(filterTransactions.map(({ id }) => id)),
                    hasCertification: this.hasDocument(filterTransactions, 'certifications'),
                    hasProof: this.hasDocument(filterTransactions, 'uploadProofs'),
                    hasInvoice: this.hasDocument(filterTransactions, 'uploadInvoices'),
                    hasPackingList: this.hasDocument(filterTransactions, 'uploadPackingLists')
                };
            }
        }
    }

    private hasDocument(transactions: TransactionEntity[], field: string) {
        const documents = transactions.map((transaction) => transaction[field]).filter((value) => !isEmpty(value));
        return documents.length > 0;
    }
}
