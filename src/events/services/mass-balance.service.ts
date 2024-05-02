import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { roundNumber } from '~core/helpers/number.helper';
import { convertToKg, isUsingSameQuantityUnit, isUsingWeightUnits } from '~events/helpers/convert-to-kg.helper';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { TimeRangeType } from '~events/types/time-range.type';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductService } from '~products/services/product.service';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class MassBalanceService {
    constructor(
        private transactionRepo: TransactionRepository,
        private productService: ProductService,
        private supplyChainService: SupplyChainService
    ) {}

    async calculate(user: UserEntity, timeRange: TimeRangeType<number>) {
        const from: Date = timeRange.from ? moment.unix(timeRange.from).toDate() : null;
        const to: Date = timeRange.to ? moment.unix(timeRange.to).toDate() : null;

        const purchases = await this.transactionRepo.getTotalPurchasedByTime(user.currentFacility.id, { from, to });
        const lastPurchase = await this.transactionRepo.getLatestPurchase(user.currentFacility);

        const doesBuyFromRawMaterialExtractor = await this.supplyChainService.doesBuyFromRawMaterialExtractor(
            user.roleId
        );

        return {
            lastUpdatedAt: lastPurchase?.createdAt,
            ...(await this.calculateForProductRole(purchases, doesBuyFromRawMaterialExtractor))
        };
    }

    private async calculateForProductRole(transactions: TransactionEntity[], doesBuyFromRawMaterialExtractor: boolean) {
        const productIds: string[] = transactions.reduce((previousValue, transaction) => {
            return previousValue.concat(transaction.transactionItems.map(({ entityId }) => entityId));
        }, []);

        const products = await this.productService.findByIds(productIds);

        if (isUsingWeightUnits(products)) {
            return {
                ...this.calculateVerifiedQuantity(transactions, products, doesBuyFromRawMaterialExtractor, (product) =>
                    convertToKg(product.quantity, product.quantityUnit)
                ),
                quantityUnit: WeightUnitEnum.KG,
                canCalculate: true
            };
        } else if (isUsingSameQuantityUnit(products)) {
            return {
                ...this.calculateVerifiedQuantity(
                    transactions,
                    products,
                    doesBuyFromRawMaterialExtractor,
                    (product) => product.quantity
                ),
                quantityUnit: products[0].quantityUnit,
                canCalculate: true
            };
        }

        return { canCalculate: false };
    }

    private calculateVerifiedQuantity(
        transactions: TransactionEntity[],
        products: ProductEntity[],
        doesBuyFromRawMaterialExtractor: boolean,
        getQuantity: (product: ProductEntity) => number
    ) {
        let verifiedQuantity = 0,
            notVerifiedQuantity = 0;
        for (const product of products) {
            const quantity = getQuantity(product);
            if (doesBuyFromRawMaterialExtractor) {
                const transaction = transactions.find(({ transactionItems }) =>
                    transactionItems.map(({ entityId }) => entityId).includes(product.id)
                );
                if (transaction.fromFacilityId) {
                    verifiedQuantity += quantity;
                } else {
                    notVerifiedQuantity += quantity;
                }
            } else {
                verifiedQuantity += (quantity * product.verifiedPercentage) / 100;
                notVerifiedQuantity += (quantity * product.notVerifiedPercentage) / 100;
            }
        }
        return {
            verifiedQuantity: roundNumber(verifiedQuantity, 2),
            notVerifiedQuantity: roundNumber(notVerifiedQuantity, 2)
        };
    }
}
