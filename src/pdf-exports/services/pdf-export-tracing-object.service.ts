import { Injectable } from '@nestjs/common';
import { countBy, groupBy, maxBy, uniqBy } from 'lodash';
import { IsNull } from 'typeorm';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { TransactionHistoryService } from '~events/services/transaction/transaction-history.service';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { LOCATION_RELATIONS } from '~locations/constants/location-relations.constant';
import { TracingCategoryEnum } from '~order/enums/tracing-category.enum';
import { OrderTraceService } from '~order/services/order-trace.service';
import { TracingSupplierType } from '~order/types/tracing-supplier.type';
import { NotLoggedSaleTransactionType } from '~pdf-exports/types/not-logged-sale-transaction.type';
import { OrderSupplierGroupBySupplier } from '~pdf-exports/types/order-supplier-group-by-supplier.type';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductService } from '~products/services/product.service';
import { FacilityRiskService } from '~risk-assessments/services/facility-risk.service';
import { ResultRiskItemType } from '~risk-assessments/types/result-risk-item.type';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class PdfExportTracingObjectService {
    constructor(
        private orderTraceService: OrderTraceService,
        private transactionHistoryService: TransactionHistoryService,
        private productService: ProductService,
        private supplyChainService: SupplyChainService,
        private roleService: RoleService,
        private facilityRiskService: FacilityRiskService
    ) {}

    async generateTracingData(user: UserEntity, orderId: string) {
        const tracingObjectList = await this.orderTraceService.getTracingObjectList(user, orderId);
        const orderSuppliers = tracingObjectList.filter(
            (traceResult) => traceResult.category === TracingCategoryEnum.TRACED
        );
        const tracingObjects = uniqBy(orderSuppliers, 'supplier.id');
        const supplierTransactions: OrderSupplierGroupBySupplier = groupBy(orderSuppliers, 'supplier.id');

        return this.getTracingObjects(tracingObjects, supplierTransactions, orderSuppliers);
    }

    private async getTracingObjects(
        tracingObjects: TracingSupplierType[],
        supplierTransactions: OrderSupplierGroupBySupplier,
        orderSuppliers: TracingSupplierType[]
    ): Promise<TracingSupplierType[]> {
        const products = await this.getProducts(orderSuppliers);
        const transactions = await this.getTransactions(orderSuppliers);

        for (const orderSupplier of tracingObjects) {
            const supplierId = orderSupplier.supplier?.id;
            if (!supplierId) {
                orderSupplier.transactions = this.getNonFarmTransactions(orderSuppliers, transactions);
                continue;
            }

            await orderSupplier.supplier.loadRelation(LOCATION_RELATIONS);

            const transactionFilter = this.getTransactionFilter(
                transactions,
                orderSupplier,
                orderSuppliers,
                supplierTransactions,
                supplierId
            );

            const canMapTransactionSell = await this.canMapTransactionSell(orderSupplier.supplier);
            if (canMapTransactionSell) {
                orderSupplier.transactions = this.mappingTransactionSell(orderSupplier, transactions);
                continue;
            }

            if (orderSupplier.supplier.typeName === UserRoleEnum.BROKER) {
                orderSupplier.transactions = this.mappingTransactionOfBroker(orderSupplier, transactions);
                continue;
            }

            orderSupplier.transactions = transactionFilter;
            (orderSupplier as any).notLoggedTransactions = this.getNotLoggedSaleTransactions(
                orderSupplier,
                orderSuppliers,
                products
            );
        }

        return tracingObjects;
    }

    private async canMapTransactionSell(supplier: FacilityEntity) {
        const supplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            fromRoleId: IsNull(),
            roleId: supplier.typeId
        });

        if (!supplyChainNode) return false;

        const canRoleLogin = await this.roleService.canRoleLogin(supplier.type);

        return !canRoleLogin;
    }

    private getTransactionFilter(
        transactions: TransactionEntity[],
        orderSupplier: TracingSupplierType,
        orderSuppliers: TracingSupplierType[],
        supplierTransactions: OrderSupplierGroupBySupplier,
        supplierId: string
    ): TransactionEntity[] {
        const orderByFromSuppliers = orderSuppliers.filter((item) => item.fromSupplierId === orderSupplier.supplier.id);
        const transactionIds = orderByFromSuppliers.map(({ transactionId }) => transactionId);
        const transactionPurchaseBySupplier = transactions.filter(
            ({ id, type }) => transactionIds.includes(id) && type === TransactionTypeEnum.PURCHASE
        );
        const transactionSellBySupplier = this.getTransactionSellBySupplier(
            supplierTransactions,
            supplierId,
            transactions
        );

        return [...transactionSellBySupplier, ...transactionPurchaseBySupplier];
    }

    private getTransactionSellBySupplier(
        supplierTransactions: OrderSupplierGroupBySupplier,
        supplierId: string,
        transactions: TransactionEntity[]
    ): TransactionEntity[] {
        const transactionIdsBySupplier = supplierTransactions[supplierId].map(({ transactionId }) => transactionId);

        return transactions.filter(
            (transaction) =>
                transactionIdsBySupplier.includes(transaction.id) &&
                transaction.toFacilityId !== supplierId &&
                transaction.type === TransactionTypeEnum.SELL
        );
    }

    private mappingTransactionSell(
        orderSupplier: TracingSupplierType,
        transactionFilter: TransactionEntity[]
    ): TransactionEntity[] {
        const transactions = [];
        const transactionTier5 = transactionFilter.filter((item) => item.fromFacilityId === orderSupplier.supplier.id);
        for (const transaction of transactionTier5) {
            transactions.push({ ...transaction, type: TransactionTypeEnum.SELL });
        }

        return transactions;
    }

    private mappingTransactionOfBroker(
        orderSupplier: TracingSupplierType,
        transactionFilter: TransactionEntity[]
    ): TransactionEntity[] {
        const transactions = [];
        const purchasedTransactions = transactionFilter.filter(
            (item) => item.fromFacilityId === orderSupplier.supplier.id
        );

        for (const transaction of purchasedTransactions) {
            transactions.push({ ...transaction, type: TransactionTypeEnum.SELL });
        }

        return transactions;
    }

    private getNonFarmTransactions(
        orderSuppliers: TracingSupplierType[],
        transactions: TransactionEntity[]
    ): TransactionEntity[] {
        const transactionOfNonFarms = [];

        const orderByFromSuppliers = orderSuppliers.filter((item) => !item.supplier?.id);
        const transactionIds = orderByFromSuppliers.map(({ transactionId }) => transactionId);
        const transactionFilterList = transactions.filter(({ id }) => transactionIds.includes(id));

        for (const transaction of transactionFilterList) {
            transactionOfNonFarms.push({ ...transaction, type: TransactionTypeEnum.SELL });
        }

        return transactionOfNonFarms;
    }

    private async getTransactions(orderSuppliers: TracingSupplierType[]): Promise<TransactionEntity[]> {
        const supplyChainNodes = await this.supplyChainService.find({ where: {}, relations: ['fromRole'] });

        const transactionIds: string[] = [];
        for (const orderSupplier of orderSuppliers) {
            if (orderSupplier.transactionId) {
                transactionIds.push(orderSupplier.transactionId);
            }
        }

        const transactions = await this.transactionHistoryService.getHistoryTransactionByIds(transactionIds);
        for (const transaction of transactions) {
            // to show text Non-participating [role] on tracing PDF
            if (!transaction.fromFacility && transaction.toFacility) {
                const node = supplyChainNodes.find(({ roleId }) => roleId === transaction.toFacility.typeId);
                if (node) {
                    (transaction as any).fromFacilityType = node.fromRole;
                }
            }
        }

        return transactions;
    }

    private async getProducts(orderSuppliers: TracingSupplierType[]): Promise<ProductEntity[]> {
        const productIds: string[] = orderSuppliers.flatMap((supplier) => supplier?.productIds || []);

        return this.productService.findPurchaseTransactionsByProductIds(productIds);
    }

    private getNotLoggedSaleTransactions(
        orderSupplier: TracingSupplierType,
        orderSuppliers: TracingSupplierType[],
        products: ProductEntity[]
    ): NotLoggedSaleTransactionType[] {
        const orderByFromSuppliers = orderSuppliers.filter((item) => item.supplier?.id === orderSupplier.supplier.id);
        const productIds = orderByFromSuppliers.flatMap((supplier) => supplier.productIds);

        if (!productIds?.length) {
            return [];
        }

        const loggedProductIds = this.getSaleLoggedProductIds(orderByFromSuppliers);
        const notLoggedProductIds = productIds.filter((id) => !loggedProductIds.includes(id));
        const notLoggedProducts = products.filter(({ id }) => notLoggedProductIds.includes(id));

        const group = groupBy(
            notLoggedProducts,
            (notLoggedProduct) => notLoggedProduct.transactionItems[0].transaction.id
        );

        return Object.entries(group).map(([, notLoggedProductGroup]) => {
            return {
                toFacility: notLoggedProductGroup[0].transactionItems[0].transaction.toFacility,
                products: notLoggedProductGroup,
                transactedAt: notLoggedProductGroup[0].transactionItems[0].transaction.transactedAt
            };
        });
    }

    private getSaleLoggedProductIds(orderSuppliers: TracingSupplierType[]): string[] {
        return orderSuppliers.reduce((previousValue, item) => {
            if (!item.transactions || !item.transactions.length) {
                return previousValue;
            }

            const productIds: string[] = [];
            for (const transaction of item.transactions) {
                if (transaction.type !== TransactionTypeEnum.SELL) {
                    continue;
                }

                for (const transactionItem of transaction.transactionItems) {
                    productIds.push(transactionItem.entityId);
                }
            }
            return previousValue.concat(productIds);
        }, []);
    }

    countFacilitiesByRiskLevel(tracingObjects: TracingSupplierType[]) {
        const riskSuppliers = tracingObjects.filter(({ supplier }) => supplier?.overallRiskLevel);
        const riskLevelCount = countBy(riskSuppliers, ({ supplier }) => supplier.overallRiskLevel);
        return Object.values(RiskScoreLevelEnum).map((riskLevel) => ({
            riskLevel,
            count: riskLevelCount[riskLevel] ?? 0
        }));
    }

    async getTopFiveIssues(tracingObjects: TracingSupplierType[]) {
        const items = tracingObjects
            .filter(({ supplier }) => supplier?.riskData?.data)
            .flatMap(({ supplier }) =>
                supplier.riskData.data.flatMap(({ indicatorRiskData }) =>
                    indicatorRiskData.flatMap(({ indicator, subIndicatorRiskData }) =>
                        subIndicatorRiskData.map(({ data, subIndicator }) => ({
                            indicator,
                            subIndicator,
                            data: data.filter(({ isIndirect }) => !isIndirect)
                        }))
                    )
                )
            )
            .filter(({ data }) => data.length);

        const groupSubIndicators = groupBy(items, ({ subIndicator }) => subIndicator.id);
        const issues = Object.entries(groupSubIndicators).map(([subIndicatorId, groupSubIndicator]) => {
            const riskItems = groupSubIndicator.flatMap(({ data }) => data);
            const risk = maxBy(riskItems, ({ risk }) => risk.score).risk;
            const count = this.countByRiskLevels(riskItems);
            return {
                indicator: groupSubIndicator[0].indicator,
                subIndicator: groupSubIndicator[0].subIndicator,
                risk,
                count
            };
        });

        issues.sort((a, b) => {
            if (b.count.extreme !== a.count.extreme) {
                return b.count.extreme - a.count.extreme;
            }
            if (b.count.high !== a.count.high) {
                return b.count.high - a.count.high;
            }
            if (b.count.medium !== a.count.medium) {
                return b.count.medium - a.count.medium;
            }
            if (b.count.low !== a.count.low) {
                return b.count.low - a.count.low;
            }
            const compareIndicatorName = a.indicator.name.localeCompare(b.indicator.name);
            if (compareIndicatorName !== 0) {
                return compareIndicatorName;
            }
            return a.subIndicator.name.localeCompare(b.subIndicator.name);
        });
        return issues.slice(0, 5);
    }

    private countByRiskLevels(riskItems: ResultRiskItemType[]) {
        return {
            extreme: this.countByRiskLevel(riskItems, RiskScoreLevelEnum.EXTREME),
            high: this.countByRiskLevel(riskItems, RiskScoreLevelEnum.HIGH),
            medium: this.countByRiskLevel(riskItems, RiskScoreLevelEnum.MEDIUM),
            low: this.countByRiskLevel(riskItems, RiskScoreLevelEnum.LOW)
        };
    }

    private countByRiskLevel(riskItems: ResultRiskItemType[], riskLevel: RiskScoreLevelEnum): number {
        return riskItems.filter(({ risk }) => risk.level === riskLevel).length;
    }
}
