import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { Between, In } from 'typeorm';
import { roundNumber } from '~core/helpers/number.helper';
import { TransformationEntity } from '~events/entities/transformation.entity';
import {
    convertToKg,
    isUsingSameQuantityUnit,
    isUsingWeightUnits,
    isWeightUnit
} from '~events/helpers/convert-to-kg.helper';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { TransformationRepository } from '~events/repositories/transformation.repository';
import { VerifiedRatioType } from '~events/types/verified-ratio.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductService } from '~products/services/product.service';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';

@Injectable()
export class VerifyRatioService {
    constructor(
        private transformationRepo: TransformationRepository,
        private transactionRepo: TransactionRepository,
        private productService: ProductService
    ) {}

    async correctVerifyRatio(facility: FacilityEntity, transactedAt: number) {
        if (facility.chainOfCustody === ChainOfCustodyEnum.PRODUCT_SEGREGATION) {
            return;
        }

        let transformations: TransformationEntity[] = await this.getTransformations(facility, transactedAt);
        await this.updateVerifiedPercentageFromTransactions(transformations);

        let productIds = this.getProductIds(transformations);
        while (productIds.length) {
            transformations = await this.getTransformationsByInputProductIds(productIds);
            await this.updateVerifiedPercentage(transformations);

            productIds = this.getProductIds(transformations);
        }
    }

    private getTransformations(facility: FacilityEntity, transactedAt: number) {
        const transactedTime = moment.unix(transactedAt).toDate();
        const sevenDaysAfter = moment.unix(transactedAt).add(7, 'days').toDate();

        return this.transformationRepo
            .createQueryBuilder('Transformation')
            .innerJoinAndSelect('Transformation.facility', 'Facility')
            .innerJoinAndSelect('Transformation.transformationItems', 'TransformationItem')
            .where({ facilityId: facility.id, createdAt: Between(transactedTime, sevenDaysAfter) })
            .andWhere('TransformationItem.isInput = false')
            .getMany();
    }

    private async getTransformationsByInputProductIds(inputIds: string[]) {
        const transformations = await this.transformationRepo
            .createQueryBuilder('Transformation')
            .innerJoin('Transformation.transformationItems', 'TransformationItem')
            .where('TransformationItem.entityId IN (:...inputIds)', { inputIds })
            .andWhere('TransformationItem.isInput = true')
            .getMany();

        const transformationIds = transformations.map(({ id }) => id);
        return this.getTransformationsByIds(transformationIds);
    }

    private getTransformationsByIds(ids: string[]) {
        return this.transformationRepo
            .createQueryBuilder('Transformation')
            .innerJoinAndSelect('Transformation.facility', 'Facility')
            .innerJoinAndSelect('Transformation.transformationItems', 'TransformationItem')
            .innerJoinAndSelect('TransformationItem.product', 'Product')
            .where({ id: In(ids) })
            .getMany();
    }

    private updateVerifiedPercentage(transformations: TransformationEntity[]): Promise<void[]> {
        return Promise.all(
            transformations.map(async (transformation) => {
                const inputs = transformation.transformationItems
                    .filter(({ isInput }) => isInput)
                    .map(({ product }) => product);
                const { verifiedPercentage, notVerifiedPercentage } =
                    this.calculateVerifiedPercentageFromInputs(inputs);

                const outputIds = transformation.transformationItems
                    .filter(({ isInput }) => !isInput)
                    .map(({ entityId }) => entityId);
                await this.productService.update({ id: In(outputIds) }, { verifiedPercentage, notVerifiedPercentage });
            })
        );
    }

    calculateVerifiedPercentageFromInputs(inputProducts?: ProductEntity[]): VerifiedRatioType {
        if (!inputProducts?.length) {
            return {
                verifiedPercentage: 0,
                notVerifiedPercentage: 100
            };
        }

        if (!this.isAbleToCalculateVerifiedPercentage(inputProducts)) {
            return { verifiedPercentage: null, notVerifiedPercentage: null };
        }

        let verifiedWeight = 0;
        let notVerifiedWeight = 0;
        for (const inputProduct of inputProducts) {
            verifiedWeight +=
                inputProduct.verifiedPercentage * this.getWeight(inputProduct.quantity, inputProduct.quantityUnit);
            notVerifiedWeight +=
                inputProduct.notVerifiedPercentage * this.getWeight(inputProduct.quantity, inputProduct.quantityUnit);
        }

        const totalWeight = verifiedWeight + notVerifiedWeight;
        const verifiedPercentage = totalWeight > 0 ? roundNumber((verifiedWeight * 100) / totalWeight, 2) : 0;

        return { verifiedPercentage, notVerifiedPercentage: 100 - verifiedPercentage };
    }

    private updateVerifiedPercentageFromTransactions(transformations: TransformationEntity[]): Promise<void[]> {
        return Promise.all(
            transformations.map(async (transformation) => {
                const { verifiedPercentage, notVerifiedPercentage } =
                    await this.calculateVerifiedPercentageFromTransactions(
                        transformation.facility,
                        transformation.createdAt
                    );

                const productIds = transformation.transformationItems.map(({ entityId }) => entityId);
                await this.productService.update({ id: In(productIds) }, { verifiedPercentage, notVerifiedPercentage });
            })
        );
    }

    async calculateVerifiedPercentageFromTransactions(
        facility: FacilityEntity,
        time: number
    ): Promise<VerifiedRatioType> {
        const toTime = moment.unix(time).toDate();
        const fromTime = moment.unix(time).subtract(7, 'days').toDate();
        const transactions = await this.transactionRepo.getRecentPurchases(facility, fromTime, toTime);

        let verifiedPercentage = 0;
        let verifiedWeight = 0;
        let totalWeight = 0;

        const products: ProductEntity[] = transactions.flatMap(({ transactionItems }) =>
            transactionItems.map(({ product }) => product)
        );

        if (!this.isAbleToCalculateVerifiedPercentage(products)) {
            return { verifiedPercentage: null, notVerifiedPercentage: null };
        }

        for (const transaction of transactions) {
            for (const { product } of transaction.transactionItems) {
                const weight = this.getWeight(product.quantity, product.quantityUnit);
                totalWeight += weight;

                if (transaction.fromFacilityId) {
                    verifiedWeight += weight;
                }
            }
        }

        verifiedPercentage = totalWeight > 0 ? roundNumber((verifiedWeight * 100) / totalWeight, 2) : 0;
        return { verifiedPercentage, notVerifiedPercentage: 100 - verifiedPercentage };
    }

    private isAbleToCalculateVerifiedPercentage(products: ProductEntity[]): boolean {
        return isUsingSameQuantityUnit(products) || isUsingWeightUnits(products);
    }

    private getWeight(quantity: number, quantityUnit: string): number {
        if (isWeightUnit(quantityUnit)) {
            return convertToKg(quantity, quantityUnit);
        }

        return quantity;
    }

    private getProductIds(transformations: TransformationEntity[]): string[] {
        return transformations.reduce((previousValue, transformation) => {
            return previousValue.concat(
                transformation.transformationItems.filter(({ isInput }) => !isInput).map(({ entityId }) => entityId)
            );
        }, []);
    }
}
