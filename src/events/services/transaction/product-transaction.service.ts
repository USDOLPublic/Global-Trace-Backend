import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { FacilityItemService } from '~events/services/facility-item.service';
import { TransactionItemService } from '~events/services/transaction/transaction-item.service';
import { TransactProductType } from '~events/types/transact-product.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { HistoryService } from '~history/services/history.service';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductFacilityService } from './product-facility.service';

@Injectable()
export class ProductTransactionService {
    constructor(
        private transactionRepo: TransactionRepository,
        private facilityItemService: FacilityItemService,
        private transactionItemService: TransactionItemService,
        private productFacilityService: ProductFacilityService,
        @Inject(forwardRef(() => HistoryService)) private historyService: HistoryService
    ) {}

    async transactProducts(data: TransactProductType) {
        const { fromFacility, toFacility, user, entityIds, transactionData } = data;
        const products = await this.productFacilityService.findFacilityItemsForTransaction(
            fromFacility,
            entityIds,
            transactionData.type
        );

        await this.validatePurchaseSellProducts(data, products);

        const transaction = await this.transactionRepo.createOne({
            weightUnit: WeightUnitEnum.KG,
            fromFacilityId: fromFacility.id,
            toFacilityId: toFacility.id,
            creatorId: user.id,
            ...transactionData
        });

        await this.transactionItemService.createMany(transaction, products);
        await this.historyService.createTransactionEvent(transaction);
        await this.facilityItemService.addItemsToFacility(toFacility, products);

        return transaction;
    }

    private validatePurchaseSellProducts(data: TransactProductType, products: ProductEntity[]) {
        const { toFacility, transactionData } = data;

        if (transactionData.type === TransactionTypeEnum.SELL) {
            return this.validateSellProducts(toFacility, products);
        }

        if (transactionData.type === TransactionTypeEnum.PURCHASE) {
            return this.validatePurchaseProducts(toFacility, products);
        }
    }

    private async validateSellProducts(toFacility: FacilityEntity, products: ProductEntity[]) {
        const entityIds = products.map(({ id }) => id);
        const transactions = await this.transactionRepo.findTransactionsByProducts(
            TransactionTypeEnum.PURCHASE,
            entityIds
        );

        if (transactions.length) {
            const hasInvalidPurchaser = transactions.some(({ toFacilityId }) => toFacilityId !== toFacility.id);

            if (hasInvalidPurchaser) {
                throw new BadRequestException({ translate: 'validation.product_purchase_by_another' });
            }
        }
    }

    private async validatePurchaseProducts(toFacility: FacilityEntity, products: ProductEntity[]) {
        const entityIds = products.map(({ id }) => id);
        const transactions = await this.transactionRepo.findTransactionsByProducts(TransactionTypeEnum.SELL, entityIds);

        if (transactions.length) {
            const hasInvalidSeller = transactions.some(({ toFacilityId }) => toFacilityId !== toFacility.id);

            if (hasInvalidSeller) {
                throw new BadRequestException({ translate: 'validation.product_sold_to_another' });
            }
        }
    }
}
