import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isNil, uniqBy } from 'lodash';
import { In } from 'typeorm';
import { FileUploadType } from '~core/types/file-upload.type';
import { LINT_COTTON_CONVERSION_RATIO } from '~events/constants/convert-weight.constant';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { convertToKg } from '~events/helpers/convert-to-kg.helper';
import { ManualAddedAttributeDto } from '~events/http/dto/manual-added-attribute.dto';
import { ManualAddedProductDto } from '~events/http/dto/manual-added-product-attribute.dto';
import { OutputProductDto } from '~events/http/dto/output-product.dto';
import { TimeRangeType } from '~events/types/time-range.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { AttributeService } from '~product-definitions/services/attribute.service';
import { ProductEntity } from '~products/entities/product.entity';
import { HarvestSeasonService } from '~role-permissions/services/harvest-season.service';
import { SupplyChainNodeEntity } from '~supply-chains/entities/supply-chain-node.entity';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { ProductActivityService } from '../product-activity.service';
import { ValidateProductAttributeService } from './validate-product-attribute.service';

@Injectable()
export class ProductAttributeService extends TransactionService {
    constructor(
        private supplyChainService: SupplyChainService,
        private attributeService: AttributeService,
        private validateProductAttributeService: ValidateProductAttributeService,
        private harvestSeasonService: HarvestSeasonService,
        private productActivityService: ProductActivityService
    ) {
        super();
    }

    async validatePurchasedProducts(products: ProductEntity[], currentFacility: FacilityEntity) {
        if (uniqBy(products, 'productDefinitionId').length !== 1) {
            throw new BadRequestException({ translate: 'error.invalid_purchased_product_list' });
        }

        const supplyChainNode: SupplyChainNodeEntity = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: currentFacility.typeId
        });

        if (!supplyChainNode) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_purchase_product' });
        }

        const sellSupplyChainNode: SupplyChainNodeEntity = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: supplyChainNode.fromRoleId,
            outputProductDefinitionId: products[0].productDefinitionId
        });

        if (!sellSupplyChainNode) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_purchase_product' });
        }
    }

    async validateSoldProducts(products: ProductEntity[], currentFacility: FacilityEntity) {
        if (uniqBy(products, 'productDefinitionId').length !== 1) {
            throw new BadRequestException({ translate: 'error.invalid_sold_product_list' });
        }

        const supplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: currentFacility.typeId,
            outputProductDefinitionId: products[0].productDefinitionId
        });

        if (!supplyChainNode) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_sell_product' });
        }
    }

    async validateManualAddedProducts(
        productDefinition: ProductDefinitionEntity,
        manualAddedProducts: ManualAddedProductDto[],
        facility: FacilityEntity,
        transactionType: TransactionTypeEnum
    ) {
        this.sanitizeManualAddedProducts(productDefinition, manualAddedProducts);

        this.validateProductAttributeService.checkRequiredAttributes(
            productDefinition,
            manualAddedProducts,
            transactionType
        );
        await this.validateProductAttributeService.checkUniqueProductCode(
            manualAddedProducts,
            facility,
            transactionType
        );
        await this.validateProductAttributeService.validateAttributesValue(
            productDefinition,
            manualAddedProducts,
            transactionType
        );
    }

    private sanitizeManualAddedProducts(
        { productDefinitionAttributes }: ProductDefinitionEntity,
        manualAddedProducts: ManualAddedProductDto[] | OutputProductDto[]
    ) {
        manualAddedProducts.forEach((manualAddedProduct) => {
            manualAddedProduct.attributes = uniqBy(manualAddedProduct.attributes, 'id').filter(({ id }) =>
                productDefinitionAttributes.find((pDA) => pDA.attributeId === id)
            );
        });
    }

    async getQuantityAndUnit(attributes: ManualAddedAttributeDto[]) {
        const foundQuantityAttribute = await this.attributeService.findOne({
            where: {
                id: In(attributes.map(({ id }) => id)),
                type: FieldTypeEnum.PRODUCT_QUANTITY,
                category: FieldCategoryEnum.NUMBER_UNIT_PAIR
            }
        });

        if (!foundQuantityAttribute) return { quantity: 0, quantityUnit: null };

        const { value, quantityUnit } = attributes.find((attr) => attr.id === foundQuantityAttribute.id);

        return { quantity: value, quantityUnit };
    }

    async getCode(attributes: ManualAddedAttributeDto[]) {
        const foundProductIdAttribute = await this.attributeService.findOne({
            where: {
                id: In(attributes.map(({ id }) => id)),
                type: FieldTypeEnum.PRODUCT_ID
            }
        });

        if (!foundProductIdAttribute) return null;

        const { value } = attributes.find((attr) => attr.id === foundProductIdAttribute.id);

        return value;
    }

    getCertifications(
        manualAddedAttributes: ManualAddedAttributeDto[],
        productDefinition: ProductDefinitionEntity
    ): FileUploadType[] {
        return manualAddedAttributes
            .filter(
                ({ id, value }) =>
                    !!productDefinition.productDefinitionAttributes.find(
                        ({ attribute }) =>
                            attribute.id === id && attribute.category === FieldCategoryEnum.ATTACHMENTS && !isNil(value)
                    )
            )
            .flatMap(({ value }) => value);
    }

    async checkStockInHand(currentUser: UserEntity, outputProducts: ProductEntity[]) {
        const timeRange: TimeRangeType<Date> = await this.harvestSeasonService.getCurrentReconciliationWindow(
            currentUser.currentFacility,
            currentUser.role
        );

        const totalPurchases = await this.productActivityService.getTotalPurchases(
            currentUser.currentFacility,
            timeRange
        );
        const totalByProducts = await this.productActivityService.getTotalByProducts(
            currentUser.currentFacility,
            timeRange
        );
        const totalOutputs = await this.productActivityService.getTotalOutputs(currentUser.currentFacility, timeRange);

        const totalLoggingOutputs = outputProducts.reduce<number>((previousValue, product) => {
            return previousValue + convertToKg(product.quantity, product.quantityUnit);
        }, 0);

        // Hardcode LINT_COTTON_CONVERSION_RATIO
        if (
            totalPurchases < totalOutputs + totalByProducts + totalLoggingOutputs ||
            LINT_COTTON_CONVERSION_RATIO * totalPurchases < totalOutputs + totalLoggingOutputs
        ) {
            throw new BadRequestException({
                translate: 'validation.insufficient_stock_in_hand_please_register_all_purchases'
            });
        }
    }
}
