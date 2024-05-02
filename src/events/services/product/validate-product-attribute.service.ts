/* eslint-disable max-lines */
import { ValidateException, ValidationError } from '@diginexhk/nestjs-exception';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { isNull, isUndefined } from 'lodash';
import moment from 'moment';
import { In } from 'typeorm';
import { createValidationError } from '~core/helpers/create-validation-error.helper';
import { maxDecimalValue } from '~core/helpers/number.helper';
import { hasAllProperties } from '~core/helpers/type.helper';
import { FileUploadType } from '~core/types/file-upload.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { LocationService } from '~locations/services/location.service';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { ManualAddedProductDto } from '~events/http/dto/manual-added-product-attribute.dto';
import { OutputProductDto } from '~events/http/dto/output-product.dto';
import { CountryProvinceDistrictAttributeType } from '~events/types/country-province-district-attribute.type';
import { ValidateAttributeErrorType } from '~events/types/validate-attribute-error.type';
import { ValidateAttributeOptionType } from '~events/types/validate-attribute-option.type';
import { ProductDefinitionAttributeEntity } from '~product-definitions/entities/product-definition-attribute.entity';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { AttributeService } from '~product-definitions/services/attribute.service';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductService } from '~products/services/product.service';

@Injectable()
export class ValidateProductAttributeService extends TransactionService {
    constructor(
        private productService: ProductService,
        private attributeService: AttributeService,
        private locationService: LocationService
    ) {
        super();
    }

    async checkUniqueProductCode(
        manualAddedProducts: ManualAddedProductDto[],
        facility: FacilityEntity,
        transactionType: TransactionTypeEnum
    ) {
        const errors: ValidationError[] = [];

        for await (const { attributes } of manualAddedProducts) {
            const foundAttribute = await this.attributeService.findOne({
                select: ['id', 'name'],
                where: {
                    id: In(attributes.map(({ id }) => id)),
                    type: FieldTypeEnum.PRODUCT_ID
                }
            });

            if (!foundAttribute) {
                continue;
            }

            const { value } = attributes.find((attr) => attr.id === foundAttribute.id);
            if (!value) {
                continue;
            }

            const foundProduct: ProductEntity =
                transactionType === TransactionTypeEnum.PURCHASE
                    ? await this.productService.findFacilityProductByCode(facility, value)
                    : await this.productService.findOneByCode(value);

            if (foundProduct) {
                throw new BadRequestException({ translate: 'validation.duplicate_product_id' });
            }
        }

        if (errors.length) throw new ValidateException(errors);
    }

    checkRequiredAttributes(
        { productDefinitionAttributes }: ProductDefinitionEntity,
        manualAddedProducts: OutputProductDto[],
        transactionType: TransactionTypeEnum
    ) {
        const requiredAttributes = productDefinitionAttributes.filter(
            (pDA) =>
                !pDA.isOptional &&
                (transactionType === TransactionTypeEnum.PURCHASE ||
                    (transactionType === TransactionTypeEnum.ASSIGN && !pDA.isAddManuallyOnly))
        );
        const errors: ValidationError[] = [];

        manualAddedProducts.forEach(({ attributes, qrCode }, index) => {
            // If has QR code, skip attribute Product ID
            let filterRequiredAttributes = requiredAttributes;
            if (qrCode) {
                filterRequiredAttributes = requiredAttributes.filter(
                    ({ attribute }) => attribute.type !== FieldTypeEnum.PRODUCT_ID
                );
            }

            const missingRequiredAttributes: ProductDefinitionAttributeEntity[] = filterRequiredAttributes.filter(
                (rA) => !!!attributes.find((attribute) => attribute.id === rA.attributeId)
            );

            if (missingRequiredAttributes.length) {
                missingRequiredAttributes.forEach(({ attribute }) =>
                    errors.push(
                        createValidationError({
                            property: `manuallyAddedData.manualAddedProducts[${index}].${attribute.name}`,
                            message: 'product_attribute_is_required',
                            detail: {
                                attributeName: attribute.name
                            }
                        })
                    )
                );
            }
        });

        if (errors.length) throw new ValidateException(errors);
    }

    async validateAttributesValue(
        { productDefinitionAttributes }: ProductDefinitionEntity,
        manualAddedProducts: ManualAddedProductDto[],
        transactionType: TransactionTypeEnum
    ) {
        const errors: ValidationError[] = [];

        for await (const [index, { attributes }] of manualAddedProducts.entries()) {
            for await (const [attributeIndex, { id, value, quantityUnit }] of attributes.entries()) {
                const {
                    isOptional,
                    isAddManuallyOnly,
                    attribute: { name: attributeName, category, options }
                } = productDefinitionAttributes.find((pDA) => pDA.attributeId === id);

                if (
                    (isOptional || (isAddManuallyOnly && transactionType === TransactionTypeEnum.ASSIGN)) &&
                    (isNull(value) || isUndefined(value))
                ) {
                    continue;
                }

                await this.validateAttributeValue(
                    category,
                    { index, attributeIndex, attributeName, options, quantityUnit, value },
                    errors
                );
            }
        }

        if (errors.length) throw new ValidateException(errors);
    }

    private async validateAttributeValue(
        category: FieldCategoryEnum,
        option: ValidateAttributeOptionType,
        errors: ValidationError[]
    ) {
        const { index, attributeIndex, attributeName, options, quantityUnit, value } = option;

        switch (category) {
            case FieldCategoryEnum.TEXT:
                this.validateText({ index, attributeIndex, attributeName, value }, errors);
                break;
            case FieldCategoryEnum.NUMBER:
                this.validateNumber({ index, attributeIndex, attributeName, value }, errors);
                break;
            case FieldCategoryEnum.PERCENTAGE:
                this.validatePercentage({ index, attributeIndex, attributeName, value }, errors);
                break;
            case FieldCategoryEnum.DATE:
                this.validateDate({ index, attributeIndex, attributeName, value }, errors);
                break;
            case FieldCategoryEnum.LIST:
                this.validateList({ index, attributeIndex, attributeName, options, value }, errors);
                break;
            case FieldCategoryEnum.NUMBER_UNIT_PAIR:
                this.validateNumberUnitPair(
                    { index, attributeIndex, attributeName, options, value, quantityUnit },
                    errors
                );
                break;
            case FieldCategoryEnum.COUNTRY_PROVINCE_DISTRICT:
                await this.validateCountryProvinceDistrict({ index, attributeIndex, attributeName, value }, errors);
                break;
            case FieldCategoryEnum.ATTACHMENTS:
                this.validateAttachments({ index, attributeIndex, attributeName, value }, errors);
                break;
        }
    }

    private createAttributeValidationError(error: ValidateAttributeErrorType) {
        const { index, property, attributeIndex, attributeName, attributeType, attributeValue, message } = error;

        return createValidationError({
            property: property || `manuallyAddedData.manualAddedProducts[${index}].attributes[${attributeIndex}]`,
            message: message || 'invalid_product_attribute_type',
            detail: {
                attributeName,
                attributeType,
                attributeValue
            }
        });
    }

    private validateText(option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName, value } = option;

        if (typeof value !== 'string') {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeType: FieldCategoryEnum.TEXT
                })
            );
        }
    }

    private validateNumber(option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName, value } = option;

        if (typeof value !== 'number') {
            return errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeType: FieldCategoryEnum.NUMBER
                })
            );
        }

        if (this.isExceedMaxValue(value)) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    message: 'exceed_maximum_decimal'
                })
            );
        }
    }

    private validatePercentage(option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName, value } = option;

        if (typeof value !== 'number' || value < 0 || value > 100) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeType: FieldCategoryEnum.PERCENTAGE,
                    message: 'invalid_product_attribute_percentage'
                })
            );
        }
    }

    private validateDate(option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName, value } = option;

        if (!moment(value).isValid()) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeType: FieldCategoryEnum.DATE
                })
            );
        }
    }

    private validateList(option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName, options, value } = option;
        const foundValue = options.find((item) => item.value === value);

        if (!!!foundValue) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeValue: options.map((item) => item.value),
                    message: 'invalid_product_attribute_value'
                })
            );
        }
    }

    private validateNumberUnitPair(option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName, options, value, quantityUnit } = option;

        if (!quantityUnit || !!!options.find((item) => item.value === quantityUnit)) {
            return errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeValue: options.map((item) => item.value),
                    message: 'invalid_quantity_unit'
                })
            );
        }

        if (typeof value !== 'number') {
            return errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeType: FieldCategoryEnum.NUMBER_UNIT_PAIR
                })
            );
        }

        if (this.isExceedMaxValue(value)) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    message: 'exceed_maximum_decimal'
                })
            );
        }
    }

    private async validateCountryProvinceDistrict(option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName, value } = option;
        const sampleCountryProvinceDistrictAttribute: CountryProvinceDistrictAttributeType = {
            countryId: 'string',
            provinceId: 'string',
            districtId: 'string'
        };
        if (!(value instanceof Object) || !hasAllProperties(value, sampleCountryProvinceDistrictAttribute)) {
            return errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeType: FieldCategoryEnum.COUNTRY_PROVINCE_DISTRICT
                })
            );
        }

        for (const [key, id] of Object.entries(value)) {
            if (!isUUID(id)) {
                errors.push(
                    this.createAttributeValidationError({
                        index,
                        attributeIndex,
                        attributeName: `${attributeName}.${key}`,
                        property: `manuallyAddedData.manualAddedProducts[${index}].attributes[${attributeIndex}].${attributeName}.${key}`,
                        message: 'product_attribute_must_be_uuid'
                    })
                );

                continue;
            }

            switch (key) {
                case 'countryId':
                    await this.validateCountry(id, option, errors);
                    break;
                case 'provinceId':
                    await this.validateProvince(id, option, errors);
                    break;
                case 'districtId':
                    await this.validateDistrict(id, option, errors);
                    break;
            }
        }
    }

    private async validateCountry(countryId: string, option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName } = option;

        const country = await this.locationService.findCountryById(countryId);

        if (!country) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    property: `manuallyAddedData.manualAddedProducts[${index}].attributes[${attributeIndex}].${attributeName}.countryId`,
                    message: 'invalid_country_id'
                })
            );
        }
    }

    private async validateProvince(provinceId: string, option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName } = option;

        const province = await this.locationService.findProvinceById(provinceId);

        if (!province) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    property: `manuallyAddedData.manualAddedProducts[${index}].attributes[${attributeIndex}].${attributeName}.provinceId`,
                    message: 'invalid_province_id'
                })
            );
        }
    }

    private async validateDistrict(districtId: string, option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName } = option;

        const district = await this.locationService.findDistrictById(districtId);

        if (!district) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    property: `manuallyAddedData.manualAddedProducts[${index}].attributes[${attributeIndex}].${attributeName}.districtId`,
                    message: 'invalid_district_id'
                })
            );
        }
    }

    private validateAttachments(option: ValidateAttributeOptionType, errors: ValidationError[]) {
        const { index, attributeIndex, attributeName, value } = option;
        const sampleFileUpload: FileUploadType = { fileName: 'string', blobName: 'string' };

        if (!Array.isArray(value)) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeType: FieldCategoryEnum.ATTACHMENTS
                })
            );
        } else if (!value.every((item) => value instanceof Object && hasAllProperties(item, sampleFileUpload))) {
            errors.push(
                this.createAttributeValidationError({
                    index,
                    attributeIndex,
                    attributeName,
                    attributeType: 'FileUploadType'
                })
            );
        }
    }

    private isExceedMaxValue(value: number) {
        return value > maxDecimalValue(14, 2);
    }
}
