import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
    calculateTotalWeight,
    convertToKg,
    isUsingWeightUnits,
    isWeightUnit
} from '~events/helpers/convert-to-kg.helper';
import { RecordProductRepository } from '~events/repositories/record-product.repository';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { RecordProductEntity } from '~events/entities/record-product.entity';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { TimeRangeType } from '~events/types/time-range.type';
import { ProductDefinitionService } from '~product-definitions/services/product-definition.service';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductService } from '~products/services/product.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class MarginOfErrorService {
    constructor(
        private transactionRepo: TransactionRepository,
        private recordProductRepo: RecordProductRepository,
        private productService: ProductService,
        private productDefinitionService: ProductDefinitionService
    ) {}

    async calculate(user: UserEntity, timeRange: TimeRangeType<number>) {
        const convertedTimeRange: TimeRangeType<Date> = {
            from: timeRange.from ? moment.unix(timeRange.from).toDate() : null,
            to: timeRange.to ? moment.unix(timeRange.to).toDate() : null
        };

        const purchasedProducts = await this.getPurchasedProducts(user, convertedTimeRange);
        const canCalculateTotalInputs = isUsingWeightUnits(purchasedProducts);
        let totalInputs: number;
        if (canCalculateTotalInputs) {
            totalInputs = calculateTotalWeight(purchasedProducts);
        }

        const recordProducts = await this.getTotalByProduct(user.currentFacility, convertedTimeRange);
        const areRecordProductsUsingWeightUnits = recordProducts.every(({ weightUnit }) => isWeightUnit(weightUnit));
        let totalByProduct: number;
        if (areRecordProductsUsingWeightUnits) {
            totalByProduct = recordProducts.reduce<number>((previousValue, item) => {
                return previousValue + convertToKg(item.totalWeight, item.weightUnit);
            }, 0);
        }

        const soldProducts = await this.getSoldProducts(user, convertedTimeRange);
        const canCalculateTotalSold = isUsingWeightUnits(soldProducts);

        const purchasedProductDefinition = await this.productDefinitionService.getPurchasedProductDefinition(user);
        const notTransformedProducts = await this.productService.getPurchaseCottonNotTransformed(
            user.currentFacility,
            purchasedProductDefinition.id,
            convertedTimeRange
        );
        const canCalculateTotalNotTransformed = isUsingWeightUnits(notTransformedProducts);

        const canCalculateTotalOutputs =
            canCalculateTotalSold && areRecordProductsUsingWeightUnits && canCalculateTotalNotTransformed;
        let totalOutputs: number;
        if (canCalculateTotalOutputs) {
            const totalSoldWeight = calculateTotalWeight(soldProducts);
            const totalNotTransformed = calculateTotalWeight(notTransformedProducts);
            totalOutputs = totalSoldWeight + totalByProduct + totalNotTransformed;
        }

        return {
            totalInputs: { canCalculate: canCalculateTotalInputs, value: totalInputs },
            totalOutputs: { canCalculate: canCalculateTotalOutputs, value: totalOutputs },
            totalByProduct: { canCalculate: areRecordProductsUsingWeightUnits, value: totalByProduct }
        };
    }

    async calculateMarginOfError(user: UserEntity, timeRange: TimeRangeType<number>) {
        const { totalInputs, totalOutputs } = await this.calculate(user, timeRange);
        const canCalculate = totalInputs.canCalculate && totalOutputs.canCalculate;
        let marginOfError: number;
        if (canCalculate) {
            marginOfError =
                totalInputs.value === 0 ? 0 : ((totalInputs.value - totalOutputs.value) / totalInputs.value) * 100;
        }

        return { canCalculate, value: marginOfError };
    }

    private async getTotalByProduct(
        facility: FacilityEntity,
        timeRange: TimeRangeType<Date>
    ): Promise<RecordProductEntity[]> {
        const condition: FindOptionsWhere<RecordProductEntity> = { facilityId: facility.id };

        if (timeRange.from && timeRange.to) {
            condition.recordedAt = Between(timeRange.from, timeRange.to);
        } else if (timeRange.from) {
            condition.recordedAt = MoreThanOrEqual(timeRange.from);
        } else if (timeRange.to) {
            condition.recordedAt = LessThanOrEqual(timeRange.to);
        }

        return this.recordProductRepo.findBy(condition);
    }

    private async getPurchasedProducts(
        user: UserEntity,
        convertedTimeRange: TimeRangeType<Date>
    ): Promise<ProductEntity[]> {
        const purchaseTransactions = await this.transactionRepo.getTotalPurchasedByTime(
            user.currentFacility.id,
            convertedTimeRange
        );
        return this.flatMapProducts(purchaseTransactions);
    }

    private async getSoldProducts(user: UserEntity, convertedTimeRange: TimeRangeType<Date>): Promise<ProductEntity[]> {
        const saleTransactions = await this.transactionRepo.getTotalSoldByTime(
            user.currentFacility.id,
            convertedTimeRange
        );
        return this.flatMapProducts(saleTransactions);
    }

    private flatMapProducts(transactions: TransactionEntity[]): ProductEntity[] {
        return transactions.flatMap(({ transactionItems }) => transactionItems).flatMap(({ product }) => product);
    }
}
