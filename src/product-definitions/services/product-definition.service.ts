import { SortParams } from '@diginexhk/nestjs-base-decorator';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import { uniqBy } from 'lodash';
import { In } from 'typeorm';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { CreateProductDefinitionAttributeDto } from '~product-definitions/http/dto/create-product-definition-attribute.dto';
import { CreateProductDefinitionDto } from '~product-definitions/http/dto/create-product-definition.dto';
import { ProductDefinitionAttributeRepository } from '~product-definitions/repositories/product-definition-attribute.repository';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { AttributeService } from './attribute.service';

@Injectable()
export class ProductDefinitionService extends TransactionService {
    public constructor(
        private productDefinitionRepo: ProductDefinitionRepository,
        private productDefinitionAttributeRepo: ProductDefinitionAttributeRepository,
        private supplyChainService: SupplyChainService,
        private attributeService: AttributeService
    ) {
        super();
    }

    async findById(id: string): Promise<ProductDefinitionEntity> {
        const productDefinition = await this.productDefinitionRepo.findById(id, {
            relations: ['productDefinitionAttributes', 'productDefinitionAttributes.attribute']
        });
        productDefinition.productDefinitionAttributes.sort((a, b) => a.order - b.order);
        return productDefinition;
    }

    all(sort: SortParams): Promise<ProductDefinitionEntity[]> {
        return this.productDefinitionRepo.findProductDefinitions(sort);
    }

    async getPurchasedProductDefinition(currentUser: UserEntity) {
        const purchaseSupplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: currentUser.currentFacility.typeId
        });

        if (!purchaseSupplyChainNode) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_purchase_product' });
        }

        const sellSupplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: purchaseSupplyChainNode.fromRoleId
        });

        if (!sellSupplyChainNode) return null;

        return this.findById(sellSupplyChainNode.outputProductDefinitionId);
    }

    async getSoldProductDefinition(currentUser: UserEntity) {
        const supplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: currentUser.currentFacility.typeId
        });

        if (!supplyChainNode) return null;

        return this.findById(supplyChainNode.outputProductDefinitionId);
    }

    async create(data: CreateProductDefinitionDto): Promise<ProductDefinitionEntity> {
        const attributes = await this.sanitizeProductDefinitions(data.attributes);
        const productDefinition = await this.productDefinitionRepo.createOne({
            name: data.name,
            nameTranslation: { en: data.name }
        });
        await this.createAttributeRelation(productDefinition.id, attributes);

        return productDefinition;
    }

    async sanitizeProductDefinitions(
        createdAttributes: CreateProductDefinitionAttributeDto[]
    ): Promise<CreateProductDefinitionAttributeDto[]> {
        const attributes = uniqBy(createdAttributes, 'id');
        await this.validateRequiredAttributes(attributes);

        return attributes;
    }

    private async validateRequiredAttributes(attributes: CreateProductDefinitionAttributeDto[]): Promise<void> {
        const existedAttributes = await this.attributeService.find({
            select: ['id', 'type'],
            where: { id: In(attributes.map(({ id }) => id)) }
        });
        const requiredAttributes = existedAttributes.map((eA) => ({
            ...eA,
            ...attributes.find((attr) => attr.id === eA.id)
        }));

        const productIdAttributes = requiredAttributes.filter(({ type }) => type === FieldTypeEnum.PRODUCT_ID);
        if (productIdAttributes.length > 1) {
            throw new BadRequestException({
                translate: 'error.duplicated_product_id_attribute'
            });
        }
        if (productIdAttributes.length === 1 && productIdAttributes[0].isOptional) {
            throw new BadRequestException({
                translate: 'error.required_product_id_attribute'
            });
        }

        const productQuantityAttributes = requiredAttributes.filter(
            ({ type }) => type === FieldTypeEnum.PRODUCT_QUANTITY
        );

        if (!productQuantityAttributes.length) {
            throw new BadRequestException({
                translate: 'error.missing_product_quantity_attribute'
            });
        }

        if (productQuantityAttributes.length !== 1) {
            throw new BadRequestException({
                translate: 'error.duplicated_product_quantity_attribute'
            });
        }

        if (productQuantityAttributes.length === 1 && productQuantityAttributes[0].isOptional) {
            throw new BadRequestException({
                translate: 'error.required_product_quantity_attribute'
            });
        }

        if (productQuantityAttributes.length === 1 && productQuantityAttributes[0].isAddManuallyOnly) {
            throw new BadRequestException({
                translate: 'error.invalid_is_add_manually_only_product_quantity_attribute'
            });
        }
    }

    async update(id: string, data: CreateProductDefinitionDto): Promise<void> {
        const attributes = await this.sanitizeProductDefinitions(data.attributes);
        await this.productDefinitionRepo.update(id, {
            name: data.name,
            nameTranslation: { en: data.name }
        });
        await this.updateAttributeRelation(id, attributes);
    }

    async destroy(id: string): Promise<void> {
        await this.supplyChainService.deleteByOption({ where: { outputProductDefinitionId: id } });
        await this.productDefinitionRepo.delete(id);
    }

    private async createAttributeRelation(
        productDefinitionId: string,
        attributes: CreateProductDefinitionAttributeDto[]
    ): Promise<void> {
        await this.productDefinitionAttributeRepo.insert(
            attributes.map(({ id: attributeId, isOptional, isAddManuallyOnly }, order) => ({
                attributeId,
                productDefinitionId,
                isOptional,
                isAddManuallyOnly,
                order
            }))
        );
    }

    private async updateAttributeRelation(
        productDefinitionId: string,
        attributes: CreateProductDefinitionAttributeDto[]
    ): Promise<void> {
        await this.productDefinitionAttributeRepo.delete({ productDefinitionId });
        await this.createAttributeRelation(productDefinitionId, attributes);
    }
}
