import { Injectable } from '@nestjs/common';
import { flatten, isNumber } from 'lodash';
import moment from 'moment';
import { In } from 'typeorm';
import { Queue } from 'typescript-collections';
import { v4 as uuidv4 } from 'uuid';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransformationEntity } from '~events/entities/transformation.entity';
import { TransactionHistoryService } from '~events/services/transaction/transaction-history.service';
import { TransformationHistoryService } from '~events/services/transformation/transformation-history.service';
import { FacilityPartnerService } from '~facilities/services/facility-partner.service';
import { FacilityService } from '~facilities/services/facility.service';
import { OrderSupplierEntity } from '~order/entities/order-supplier.entity';
import { TracingCategoryEnum } from '~order/enums/tracing-category.enum';
import { TracingSupplierType } from '~order/types/tracing-supplier.type';
import { ProductService } from '~products/services/product.service';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { OrderSupplierService } from './order-supplier.service';
import { TracingUtilityService } from './tracing-utility.service';

@Injectable()
export class TraceService {
    constructor(
        private orderSupplierService: OrderSupplierService,
        private transactionHistoryService: TransactionHistoryService,
        private transformationHistoryService: TransformationHistoryService,
        private facilityService: FacilityService,
        private tracingUtilityService: TracingUtilityService,
        private productService: ProductService,
        private facilityPartnerService: FacilityPartnerService,
        private supplyChainService: SupplyChainService
    ) {}

    async getTraceOrderResult(user: UserEntity, orderId: string): Promise<TracingSupplierType[]> {
        const orderSuppliers: OrderSupplierEntity[] = await this.orderSupplierService.getOrderSuppliers(user, orderId);
        let tracingObjects: TracingSupplierType[] = orderSuppliers.map((supplier) =>
            this.tracingUtilityService.convertToTracingObject(supplier)
        );
        const transactionIds: string[] = [];
        const parentIds: string[] = [];
        const queue: Queue<TracingSupplierType> = this.initQueue(orderSuppliers, tracingObjects);

        while (!queue.isEmpty()) {
            const tracingObject: TracingSupplierType = queue.dequeue();
            const traceResults: TracingSupplierType[] = await this.trace(tracingObject);

            if (!traceResults?.length) {
                continue;
            }

            this.tracingUtilityService.loopItemInTraceResult({
                traceResults,
                transactionIds,
                tracingObjects,
                parentIds,
                queue
            });
        }

        tracingObjects = await Promise.all(
            tracingObjects.map(async (orderSupplier) => {
                if (
                    orderSupplier.supplier &&
                    orderSupplier.supplier.roleType === RoleTypeEnum.PRODUCT &&
                    !orderSupplier.supplier.selfAssessment
                ) {
                    const facilityInfo = await this.facilityService.findFacilityWithRelations(
                        orderSupplier.supplier.id
                    );
                    orderSupplier.supplier.users = facilityInfo.users;
                }

                return orderSupplier;
            })
        );

        return tracingObjects;
    }

    async getBrokerPartners(tracingObjects: TracingSupplierType[]): Promise<TracingSupplierType[]> {
        const brokerTracingSuppliers: TracingSupplierType[] = tracingObjects.filter(
            ({ supplier }) => supplier && supplier.typeName === UserRoleEnum.BROKER
        );
        const suppliers = await Promise.all(
            brokerTracingSuppliers.map(async (brokerTracingSupplier: TracingSupplierType) => {
                const facilityTypeIds = await this.tracingUtilityService.getBrokerPartnerFacilityTypeIds(
                    brokerTracingSupplier.orderSupplierTypeId
                );
                const partners = await this.facilityPartnerService.getFacilityPartnersByTypeIds(
                    brokerTracingSupplier.supplier,
                    facilityTypeIds
                );

                return partners.map((partner) => ({
                    supplier: partner,
                    role: partner.type,
                    orderSupplierId: uuidv4(),
                    category: TracingCategoryEnum.TRACED,
                    isRoot: false,
                    parentId: brokerTracingSupplier.orderSupplierId,
                    fromSupplierId: brokerTracingSupplier.supplier.id,
                    transactedAt: brokerTracingSupplier.transactedAt
                }));
            })
        );

        return flatten(suppliers);
    }

    private initQueue(suppliers: OrderSupplierEntity[], tracingObjects: TracingSupplierType[]) {
        const fromSupplierIds = suppliers.map(({ fromSupplierId }) => fromSupplierId);
        const queue: Queue<TracingSupplierType> = new Queue();

        for (const tracingObject of tracingObjects) {
            if (!fromSupplierIds.includes(tracingObject.supplier.id)) {
                queue.enqueue(tracingObject);
            }
        }
        return queue;
    }

    private trace(tracingObject: TracingSupplierType): Promise<TracingSupplierType[]> {
        if (tracingObject.tracedPurchasedAt) {
            return this.traceFromPurchasedAt(
                tracingObject,
                tracingObject.tracedPurchasedAt,
                tracingObject.tracedPurchasedAtLevel + 1
            );
        }

        if (tracingObject.category === TracingCategoryEnum.SUPPLIER_MAPPING) {
            return this.traceFromSupplierMapping(tracingObject);
        }

        return this.traceFromProduct(tracingObject);
    }

    private async traceFromSupplierMapping(tracingObject: TracingSupplierType): Promise<TracingSupplierType[]> {
        const { purchaseOrderNumber, invoiceNumber, packingListNumber, purchasedAt } = tracingObject.transactionInfo;

        if (purchaseOrderNumber) {
            const purchaseOrderNumberResult = await this.tracePurchaseOrderNumber(tracingObject, purchaseOrderNumber);

            if (purchaseOrderNumberResult) {
                return purchaseOrderNumberResult;
            }
        }

        if (invoiceNumber) {
            const invoiceNumberResult = await this.traceInvoiceNumber(tracingObject, invoiceNumber);

            if (invoiceNumberResult?.length) {
                return invoiceNumberResult;
            }
        }

        if (packingListNumber) {
            const packingListNumberResult = await this.tracePackingListNumber(tracingObject, packingListNumber);

            if (packingListNumberResult?.length) {
                return packingListNumberResult;
            }
        }

        return this.traceFromPurchasedAt(tracingObject, purchasedAt, 1);
    }

    private async tracePurchaseOrderNumber(
        tracingObject: TracingSupplierType,
        purchaseOrderNumber: string
    ): Promise<TracingSupplierType[]> {
        const purchaseTransaction = await this.transactionHistoryService.findTransactionByPurchaseOrderNumber(
            tracingObject.supplier,
            purchaseOrderNumber
        );

        if (purchaseTransaction) {
            const purchaseTracingObject = await this.tracingUtilityService.convertTransactionToTracingObject(
                tracingObject,
                purchaseTransaction
            );

            const productIds = purchaseTransaction.transactionItems.map(({ entityId }) => entityId);
            const saleTransactions = await this.transactionHistoryService.findSellTransactionsByProducts(
                purchaseTransaction.fromFacility,
                productIds
            );
            const saleTracingObjects = await Promise.all(
                saleTransactions.map((saleTransaction) => {
                    delete saleTransaction.transactionItems;
                    return this.tracingUtilityService.convertTransactionToTracingObject(tracingObject, saleTransaction);
                })
            );

            return [purchaseTracingObject, ...saleTracingObjects];
        }
    }

    private async traceInvoiceNumber(
        tracingObject: TracingSupplierType,
        invoiceNumber: string
    ): Promise<TracingSupplierType[]> {
        const transaction = await this.transactionHistoryService.findTransactionByInvoiceNumber(
            tracingObject.supplier,
            invoiceNumber
        );

        if (transaction) {
            return this.traceFromProduct({
                supplier: tracingObject.supplier,
                role: tracingObject.supplier.type,
                orderSupplierId: tracingObject.orderSupplierId,
                category: TracingCategoryEnum.SUPPLIER_MAPPING,
                productIds: this.tracingUtilityService.mapTransactionItemsToProducts(transaction),
                isRoot: false,
                parentId: tracingObject.parentId,
                fromSupplierId: tracingObject.fromSupplierId,
                transactedAt: transaction.transactedAt
            });
        }
    }

    private async tracePackingListNumber(
        tracingObject: TracingSupplierType,
        packingListNumber: string
    ): Promise<TracingSupplierType[]> {
        const transaction = await this.transactionHistoryService.findTransactionByPackingListNumber(
            tracingObject.supplier,
            packingListNumber
        );

        if (transaction) {
            return this.traceFromProduct({
                supplier: tracingObject.supplier,
                role: tracingObject.supplier.type,
                orderSupplierId: tracingObject.orderSupplierId,
                category: TracingCategoryEnum.SUPPLIER_MAPPING,
                productIds: this.tracingUtilityService.mapTransactionItemsToProducts(transaction),
                isRoot: false,
                parentId: tracingObject.parentId,
                fromSupplierId: tracingObject.fromSupplierId,
                transactedAt: transaction.transactedAt
            });
        }
    }

    private async traceFromPurchasedAt(
        tracingObject: TracingSupplierType,
        purchasedAt: number | Date,
        level: number = 1
    ): Promise<TracingSupplierType[]> {
        if (!tracingObject.supplier) {
            return [];
        }
        const to = isNumber(purchasedAt) ? moment.unix(purchasedAt) : moment(purchasedAt);
        const from = to.clone().subtract(level * 2, 'weeks');
        const transactions = await this.transactionHistoryService.findTransactionWithinTimeRange(
            tracingObject.supplier,
            from.toDate(),
            to.toDate()
        );

        if (level === 1) {
            tracingObject.tracedPurchasedAt = purchasedAt;
            tracingObject.tracedPurchasedAtLevel = 0;
        }

        return Promise.all(
            transactions.map(async (transaction) => {
                // Do not show product certification for raw material extractor
                if (transaction.fromFacility?.type?.isRawMaterialExtractor) {
                    delete transaction.transactionItems;
                }

                const tracingSupplier = await this.tracingUtilityService.convertTransactionToTracingObject(
                    tracingObject,
                    transaction
                );
                return {
                    ...tracingSupplier,
                    tracedPurchasedAt: purchasedAt,
                    tracedPurchasedAtLevel: level
                };
            })
        );
    }

    private async traceFromProduct(tracingObject: TracingSupplierType): Promise<TracingSupplierType[]> {
        if (!tracingObject.productIds.length) {
            return;
        }

        const productIds = tracingObject.productIds;
        const transformations = await this.transformationHistoryService.getTransformationFromOutput(
            tracingObject.supplier,
            productIds
        );

        if (!transformations.length) {
            return;
        }

        const product = await this.productService.findOne({
            where: { id: In(productIds) }
        });
        const isOutputOfSecondNode = await this.supplyChainService.isOutputOfSecondNode(product.productDefinitionId);
        if (isOutputOfSecondNode) {
            return this.traceManuallyPurchasedProduct(transformations, tracingObject);
        }

        const transformationIds = transformations.map(({ id }) => id);
        const inputProducts = await this.transformationHistoryService.getInputProducts(transformationIds);

        if (!inputProducts.length) {
            return;
        }

        const inputProductIds = inputProducts.map(({ entityId }) => entityId);
        const transactions = await this.transactionHistoryService.findTransactionsTransactProducts(
            tracingObject.supplier,
            inputProductIds
        );

        if (!transactions.length) {
            return;
        }

        return Promise.all(
            transactions.map((transaction) =>
                this.tracingUtilityService.convertTransactionToTracingObject(tracingObject, transaction)
            )
        );
    }

    private async traceManuallyPurchasedProduct(
        transformations: TransformationEntity[],
        fromTracingObject: TracingSupplierType
    ): Promise<TracingSupplierType[]> {
        const result = await Promise.all(
            transformations.map(async (transformation) => {
                const transactions: TransactionEntity[] =
                    await this.transactionHistoryService.findManuallyPurchasedProductFromStartDateOfSeason(
                        fromTracingObject.supplier,
                        transformation.createdAt
                    );

                return Promise.all(
                    transactions.map((transaction) =>
                        this.tracingUtilityService.convertTransactionToTracingObject(fromTracingObject, transaction)
                    )
                );
            })
        );
        return flatten(result);
    }
}
