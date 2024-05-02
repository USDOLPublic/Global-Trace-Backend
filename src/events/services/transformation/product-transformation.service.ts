import { BadRequestException, Injectable } from '@nestjs/common';
import { uniqBy } from 'lodash';
import moment from 'moment';
import { In } from 'typeorm';
import { allSettled } from '~core/helpers/settled.helper';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { calculateTotalWeight, convertToKg } from '~events/helpers/convert-to-kg.helper';
import { AssignProductDto } from '~events/http/dto/assign-product.dto';
import { OutputProductDataDto } from '~events/http/dto/output-product-data.dto';
import { OutputProductDto } from '~events/http/dto/output-product.dto';
import { TransformationRepository } from '~events/repositories/transformation.repository';
import { TransformationItemService } from '~events/services/transformation/transformation-item.service';
import { VerifiedRatioType } from '~events/types/verified-ratio.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { HistoryService } from '~history/services/history.service';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductService } from '~products/services/product.service';
import { QrCodeService } from '~qr-codes/services/qr-code.service';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { ProductAttributeService } from '../product/product-attribute.service';
import { ProductFacilityService } from '../transaction/product-facility.service';
import { VerifyRatioService } from '../verify-ratio.service';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { HarvestSeasonService } from '~role-permissions/services/harvest-season.service';

@Injectable()
export class ProductTransformationService {
    constructor(
        private transformationRepo: TransformationRepository,
        private transactionRepo: TransactionRepository,
        private productDefinitionRepo: ProductDefinitionRepository,
        private transformationItemService: TransformationItemService,
        private productFacilityService: ProductFacilityService,
        private historyService: HistoryService,
        private productAttributeService: ProductAttributeService,
        private productService: ProductService,
        private supplyChainService: SupplyChainService,
        private qrCodeService: QrCodeService,
        private verifyRatioService: VerifyRatioService,
        private harvestSeasonService: HarvestSeasonService
    ) {}

    async assignProducts(currentUser: UserEntity, data: AssignProductDto) {
        const { inputProductIds, outputProduct } = data;
        const currentFacility = currentUser.currentFacility;
        let inputProducts: ProductEntity[] = [];

        if (inputProductIds?.length) {
            inputProducts = await this.productFacilityService.findFacilityItems(currentFacility, inputProductIds);
            await this.validateInputProducts(inputProducts, currentFacility);
            await this.validateInputProductsPurchasedReconciliationWindow(
                currentFacility,
                currentUser.role,
                inputProducts
            );
        }

        await this.validateOutputProducts(outputProduct.productDefinitionId, currentFacility);

        const transformation = await this.transformationRepo.createOne({
            facility: currentFacility,
            creatorId: currentUser.id
        });
        await this.historyService.createTransformationEvent(transformation);

        let verifiedRatio: VerifiedRatioType = await this.calculateVerifiedPercentage(currentFacility, inputProducts);
        const outputProducts = await this.createOutputProducts(currentUser, outputProduct, verifiedRatio);

        if (inputProducts?.length) {
            this.checkOutputLessThanInput(inputProducts, outputProducts);

            await this.productService.update({ id: In(inputProductIds) }, { isTransformed: true });
            await this.transformationItemService.createMany(transformation, inputProducts, true);
        } else {
            await this.productAttributeService.checkStockInHand(currentUser, outputProducts);
        }

        await this.transformationItemService.createMany(transformation, outputProducts);

        return transformation;
    }

    private async validateInputProductsPurchasedReconciliationWindow(
        facility: FacilityEntity,
        role: RoleEntity,
        inputProducts: ProductEntity[]
    ) {
        const productIds = inputProducts.map(({ id }) => id);
        const transactions = await this.transactionRepo.findTransactionsPurchaseProducts(facility, productIds);

        const timeRange = await this.harvestSeasonService.getCurrentReconciliationWindow(facility, role);
        if (timeRange.from && timeRange.to) {
            for (const transaction of transactions) {
                if (!moment.unix(transaction.transactedAt as number).isBetween(timeRange.from, timeRange.to)) {
                    throw new BadRequestException({
                        translate: 'error.using_purchase_from_past_reconciliation_window'
                    });
                }
            }
        }
    }

    private async validateInputProducts(products: ProductEntity[], facility: FacilityEntity) {
        if (uniqBy(products, 'productDefinitionId').length !== 1) {
            throw new BadRequestException({ translate: 'error.invalid_input_product_list' });
        }

        const supplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: facility.typeId
        });

        if (!supplyChainNode) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_assign_product' });
        }

        const sellSupplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: supplyChainNode.fromRoleId,
            outputProductDefinitionId: products[0].productDefinitionId
        });

        if (!sellSupplyChainNode) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_assign_product' });
        }
    }

    private async validateOutputProducts(productDefinitionId: string, facility: FacilityEntity) {
        const supplyChainNodeRepo = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: facility.typeId,
            outputProductDefinitionId: productDefinitionId
        });

        if (!supplyChainNodeRepo) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_assign_product' });
        }
    }

    private async createOutputProducts(
        currentUser: UserEntity,
        outputProductData: OutputProductDataDto,
        verifiedRatio: VerifiedRatioType
    ): Promise<ProductEntity[]> {
        if (!outputProductData.outputProducts.length) return;

        const { productDefinitionId, outputProducts } = outputProductData;
        const productDefinition = await this.productDefinitionRepo.findOneOrFail({
            where: { id: productDefinitionId },
            relations: ['productDefinitionAttributes', 'productDefinitionAttributes.attribute']
        });

        this.removeProductIdIfHasQrCode(outputProducts, productDefinition);

        await this.productAttributeService.validateManualAddedProducts(
            productDefinition,
            outputProducts,
            currentUser.currentFacility,
            TransactionTypeEnum.ASSIGN
        );

        return allSettled(
            outputProducts.map(async ({ qrCode, dnaIdentifier, attributes }) => {
                const code: string | null = await this.productAttributeService.getCode(attributes);
                const { quantity, quantityUnit } = await this.productAttributeService.getQuantityAndUnit(attributes);
                const certifications = this.productAttributeService.getCertifications(attributes, productDefinition);
                const product = await this.productService.createProduct(currentUser.currentFacility, {
                    code,
                    quantity,
                    quantityUnit,
                    productDefinitionId,
                    additionalAttributes: attributes.map(({ id: attributeId, value }) => ({
                        attributeId,
                        value,
                        quantityUnit
                    })),
                    certifications,
                    dnaIdentifier,
                    verifiedRatio
                });

                if (qrCode) {
                    await this.qrCodeService.assignProduct(qrCode, product);
                }

                return product;
            })
        );
    }

    private removeProductIdIfHasQrCode(outputProducts: OutputProductDto[], productDefinition: ProductDefinitionEntity) {
        const productIdAttribute = productDefinition.productDefinitionAttributes.find(
            ({ attribute }) => attribute.type === FieldTypeEnum.PRODUCT_ID
        );

        if (!productIdAttribute) {
            return;
        }

        for (const outputProduct of outputProducts) {
            if (outputProduct.qrCode) {
                outputProduct.attributes = outputProduct.attributes.filter(
                    ({ id }) => id !== productIdAttribute.attributeId
                );
            }
        }
    }

    private checkOutputLessThanInput(inputProducts: ProductEntity[], outputProducts: ProductEntity[]) {
        const inputTotalWeight = calculateTotalWeight(inputProducts);
        const outputTotalWeight = calculateTotalWeight(outputProducts);

        if (outputTotalWeight > inputTotalWeight) {
            throw new BadRequestException({ translate: 'error.assign_product_id_output_product_list' });
        }
    }

    calculateTotalWeight(products: { quantity: number; quantityUnit?: string }[]) {
        return products.reduce<number>(
            (previousValue, item) => previousValue + convertToKg(item.quantity, item.quantityUnit),
            0
        );
    }

    private async calculateVerifiedPercentage(
        facility: FacilityEntity,
        inputProducts?: ProductEntity[]
    ): Promise<VerifiedRatioType> {
        const doesBuyFromRawMaterialExtractor = await this.supplyChainService.doesBuyFromRawMaterialExtractor(
            facility.typeId
        );
        if (doesBuyFromRawMaterialExtractor) {
            if (facility.chainOfCustody === ChainOfCustodyEnum.PRODUCT_SEGREGATION) {
                return {
                    verifiedPercentage: 100,
                    notVerifiedPercentage: 0
                };
            }

            return this.verifyRatioService.calculateVerifiedPercentageFromTransactions(facility, moment().unix());
        }

        return this.verifyRatioService.calculateVerifiedPercentageFromInputs(inputProducts);
    }
}
