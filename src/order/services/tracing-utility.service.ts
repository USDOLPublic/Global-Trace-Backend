import { Injectable } from '@nestjs/common';
import { isEmpty, pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { getFacilityTypeName } from '~facilities/helpers/get-facility-type-name.helper';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { OrderSupplierEntity } from '~order/entities/order-supplier.entity';
import { TracingCategoryEnum } from '~order/enums/tracing-category.enum';
import { ItemTraceResultType } from '~order/types/item-supplier.type';
import { MappingSupplierType } from '~order/types/mapping-supplier.type';
import { TracingSupplierType } from '~order/types/tracing-supplier.type';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';

@Injectable()
export class TracingUtilityService {
    constructor(private supplyChainService: SupplyChainService) {}

    loopItemInTraceResult({ traceResults, transactionIds, tracingObjects, parentIds, queue }: ItemTraceResultType) {
        for (const item of traceResults) {
            if (item.transactionId) {
                if (!transactionIds.includes(item.transactionId)) {
                    transactionIds.push(item.transactionId);
                    tracingObjects.push(item);
                    queue.enqueue(item);
                }
                // else if (item.parentId && !parentIds.includes(item.parentId)) {
                //     transactionIds.push(item.transactionId);
                //     tracingObjects.push(item);
                // }
            } else {
                tracingObjects.push(item);
                queue.enqueue(item);
            }

            // if (item.parentId && !parentIds.includes(item.parentId)) {
            //     parentIds.push(item.parentId);
            // }
        }
    }

    convertToTracingObject(orderSupplier: OrderSupplierEntity): TracingSupplierType {
        return {
            ...pick(orderSupplier, ['supplier', 'parentId', 'fromSupplierId']),
            role: orderSupplier.supplier.type,
            orderSupplierId: orderSupplier.id,
            category: TracingCategoryEnum.SUPPLIER_MAPPING,
            isRoot: isEmpty(orderSupplier.fromSupplierId),
            transactedAt: orderSupplier.purchasedAt,
            transactionInfo: {
                ...pick(orderSupplier, ['purchaseOrderNumber', 'purchasedAt', 'invoiceNumber', 'packingListNumber'])
            }
        };
    }

    async getBrokerPartnerFacilityTypeIds(orderSupplierTypeId: string): Promise<string[]> {
        const supplyChainNodes = await this.supplyChainService.findSupplyChainNodes({ roleId: orderSupplierTypeId });

        return supplyChainNodes.map(({ fromRoleId }) => fromRoleId);
    }

    async convertTransactionToTracingObject(
        fromTracingObject: TracingSupplierType,
        transaction: TransactionEntity
    ): Promise<TracingSupplierType> {
        const productIds = transaction.transactionItems ? this.mapTransactionItemsToProducts(transaction) : [];
        const role = await this.getSupplierRole(transaction.fromFacility, fromTracingObject.supplier);

        return {
            supplier: transaction.fromFacility,
            role,
            orderSupplierId: uuidv4(),
            category: TracingCategoryEnum.TRACED,
            productIds,
            isRoot: false,
            parentId: fromTracingObject.orderSupplierId,
            fromSupplierId: fromTracingObject.supplier.id,
            transactionId: transaction.id,
            transactionType: transaction.type,
            transactedAt: transaction.transactedAt,
            orderSupplierTypeId: fromTracingObject.supplier.typeId
        };
    }

    mapTransactionItemsToProducts(transaction: TransactionEntity): string[] {
        return transaction.transactionItems.map(({ entityId }) => entityId);
    }

    convertMappingSuppliers(tracingObjects: TracingSupplierType[]): MappingSupplierType[] {
        return tracingObjects.map((tracingObject) => ({
            ...tracingObject.supplier,
            orderSupplierId: tracingObject.orderSupplierId,
            isRoot: tracingObject.isRoot,
            label: getFacilityTypeName(tracingObject.supplier.typeName, tracingObject.role),
            targets: tracingObject.parentId ? [tracingObject.parentId] : []
        }));
    }

    async getSupplierRole(fromFacility: FacilityEntity, toFacility: FacilityEntity): Promise<RoleEntity> {
        if (fromFacility?.type) {
            return fromFacility.type;
        }

        return this.supplyChainService.getRoleOfPreviousNode(toFacility.typeId);
    }
}
