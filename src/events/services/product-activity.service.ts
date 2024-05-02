import { Injectable } from '@nestjs/common';
import { TransformationEntity } from '~events/entities/transformation.entity';
import { convertToKg } from '~events/helpers/convert-to-kg.helper';
import { RecordProductRepository } from '~events/repositories/record-product.repository';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { TransformationRepository } from '~events/repositories/transformation.repository';
import { TimeRangeType } from '~events/types/time-range.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductEntity } from '~products/entities/product.entity';

@Injectable()
export class ProductActivityService {
    constructor(
        private transactionRepo: TransactionRepository,
        private recordProductRepo: RecordProductRepository,
        private transformationRepo: TransformationRepository
    ) {}

    async getTotalPurchases(facility: FacilityEntity, timeRange: TimeRangeType<Date>): Promise<number> {
        const transactionPurchases = await this.transactionRepo.getTotalPurchasedByTime(facility.id, timeRange);

        return transactionPurchases
            .flatMap((transaction) => transaction.transactionItems)
            .reduce<number>((previousValue, { product: { quantity, quantityUnit } }) => {
                return previousValue + convertToKg(quantity, quantityUnit);
            }, 0);
    }

    async getTotalByProducts(facility: FacilityEntity, timeRange: TimeRangeType<Date>): Promise<number> {
        const recordProducts = await this.recordProductRepo.getRecordByProduct(facility.id, timeRange);
        return recordProducts.reduce<number>((previousValue, item) => {
            return previousValue + convertToKg(item.totalWeight, item.weightUnit);
        }, 0);
    }

    async getTotalOutputs(facility: FacilityEntity, timeRange: TimeRangeType<Date>): Promise<number> {
        let totalOutputs: number = 0;
        const transformations: TransformationEntity[] = await this.transformationRepo.getTotalAssignProductByTime(
            facility.id,
            timeRange
        );

        if (transformations.length > 0) {
            const products: ProductEntity[] = transformations.flatMap(({ transformationItems }) =>
                transformationItems.map(({ product }) => product)
            );

            totalOutputs = products.reduce<number>((previousValue, product) => {
                return previousValue + convertToKg(product.quantity, product.quantityUnit);
            }, 0);
        }
        return totalOutputs;
    }
}
