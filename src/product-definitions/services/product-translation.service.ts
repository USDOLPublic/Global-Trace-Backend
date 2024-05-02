import { trans } from '@diginexhk/nestjs-cls-translation';
import { StorageService, generateUniqueName } from '@diginexhk/nestjs-storage';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import Joi from 'joi';
import { isUuidV4 } from '~core/helpers/string.helper';
import { addMissingTranslations } from '~core/helpers/translation.helper';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { UploadProductTranslationResponse } from '~product-definitions/http/response/upload-product-translation.response';
import { UploadProductTranslationItem } from '~product-definitions/interfaces/upload-product-translation-item.interface';
import { AttributeFileRepository } from '~product-definitions/repositories/attribute-file.repository';
import { AttributeRepository } from '~product-definitions/repositories/attribute.repository';
import { ProductDefinitionFileRepository } from '~product-definitions/repositories/product-definition-file.repository';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';
import { ProductTranslationValidationType } from '~product-definitions/types/product-translation-validation-error.type';
import { ProductTranslationValidationResultType } from '~product-definitions/types/product-translation-validation-result.type';

@Injectable()
export class ProductTranslationService extends TransactionService {
    public constructor(
        private productDefinitionRepo: ProductDefinitionRepository,
        private attributeRepo: AttributeRepository,
        private productDefinitionFileRepo: ProductDefinitionFileRepository,
        private attributeFileRepo: AttributeFileRepository,
        private storageService: StorageService
    ) {
        super();
    }

    get schema() {
        /* eslint-disable @typescript-eslint/naming-convention */
        return Joi.object({
            id: Joi.string()
                .required()
                .guid()
                .messages({
                    'any.base': trans('import.invalid_id_in_object'),
                    'any.required': trans('import.require_id_in_object'),
                    'string.guid': trans('import.id_must_be_uuid')
                }),
            name: Joi.string()
                .max(255)
                .required()
                .messages({
                    'any.base': trans('import.invalid_name_in_object'),
                    'any.required': trans('import.require_name_in_object')
                }),
            nameTranslation: Joi.object()
                .pattern(
                    Joi.string()
                        .pattern(/^[a-z]+$/)
                        .max(255)
                        .required(),
                    Joi.string()
                        .max(255)
                        .required()
                        .messages({
                            'string.base': trans('import.invalid_language_translation', {
                                args: { languageTranslation: '{{#label}}' }
                            })
                        })
                )
                .messages({
                    'object.base': trans('import.invalid_name_translation')
                }),
            index: Joi.number().optional()
        });
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    // eslint-disable-next-line max-lines-per-function
    get attributeSchema() {
        return Joi.object({
            id: Joi.string()
                .required()
                .guid()
                .messages({
                    'any.base': trans('import.invalid_id_in_object'),
                    'any.required': trans('import.require_id_in_object'),
                    'string.guid': trans('import.id_must_be_uuid')
                }),
            category: Joi.string()
                .max(255)
                .required()
                .valid(...Object.values(FieldCategoryEnum))
                .messages({
                    'any.base': trans('import.invalid_category_in_object'),
                    'any.required': trans('import.require_category_in_object')
                }),
            name: Joi.string()
                .max(255)
                .required()
                .messages({
                    'any.base': trans('import.invalid_name_in_object'),
                    'any.required': trans('import.require_name_in_object')
                }),
            nameTranslation: Joi.object()
                .pattern(
                    Joi.string()
                        .pattern(/^[a-z]+$/)
                        .max(255)
                        .required(),
                    Joi.string()
                        .max(255)
                        .required()
                        .messages({
                            'string.base': trans('import.invalid_language_translation', {
                                args: { languageTranslation: '{{#label}}' }
                            })
                        })
                )
                .messages({
                    'object.base': trans('import.invalid_name_translation')
                }),
            options: Joi.when('category', {
                is: Joi.string().valid(FieldCategoryEnum.LIST, FieldCategoryEnum.NUMBER_UNIT_PAIR),
                then: Joi.array().items(
                    Joi.object({
                        value: Joi.string()
                            .max(255)
                            .required()
                            .messages({
                                'any.base': trans('import.invalid_name_in_object'),
                                'any.required': trans('import.require_name_in_object')
                            }),
                        translation: Joi.object()
                            .pattern(
                                Joi.string()
                                    .pattern(/^[a-z]+$/)
                                    .max(255)
                                    .required(),
                                Joi.string()
                                    .max(255)
                                    .required()
                                    .messages({
                                        'string.base': trans('import.invalid_language_translation', {
                                            args: { languageTranslation: '{{#label}}' }
                                        })
                                    })
                            )
                            .messages({
                                'object.base': trans('import.invalid_name_translation')
                            })
                    })
                ),
                otherwise: Joi.optional()
            }),
            index: Joi.number().optional()
        });
    }

    async getProductTranslations() {
        const productDefinitions = await this.productDefinitionRepo.find({ select: ['id', 'name', 'nameTranslation'] });

        for (let i = 0; i < productDefinitions.length; i++) {
            productDefinitions[i]['index'] = i;
        }

        return addMissingTranslations(productDefinitions, 'nameTranslation');
    }

    async getProductAttributeTranslations() {
        const attributes = await this.attributeRepo.find({
            select: ['id', 'name', 'category', 'nameTranslation', 'options']
        });

        for (let i = 0; i < attributes.length; i++) {
            attributes[i]['index'] = i;

            const attribute = attributes[i];
            if (
                attribute.category === FieldCategoryEnum.LIST ||
                attribute.category === FieldCategoryEnum.NUMBER_UNIT_PAIR
            ) {
                addMissingTranslations(attribute.options, 'translation');
            } else {
                delete attribute.options;
            }
        }

        return addMissingTranslations(attributes, 'nameTranslation');
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    private async validateTranslationFile(
        file: Express.Multer.File,
        type: 'Product' | 'Attribute'
    ): Promise<ProductTranslationValidationResultType> {
        const uploadedTranslations = this.readTranslationJsonFile(file, type);

        if (!uploadedTranslations?.length) {
            throw new BadRequestException({
                translate:
                    type === 'Product'
                        ? 'error.invalid_product_translation_file'
                        : 'error.invalid_product_attribute_translation_file'
            });
        }

        const validationErrors: ProductTranslationValidationType[] = [];
        let validatedItemCount = uploadedTranslations.length;
        const isTypeProduct = type === 'Product';
        const schema = isTypeProduct ? this.schema : this.attributeSchema;
        uploadedTranslations.forEach(async (uploadedTranslation, index) => {
            const { error } = schema.validate(uploadedTranslation, { abortEarly: false });
            let errors = [];

            if (error) {
                errors = error.message.split('. ').map((message) => ({
                    key: message.match(/\\?"(.*?)(?<!\\)"/gm)[0].replace(/\"/g, ''),
                    error: message.trim().replace(/\"/g, ''),
                    isShowKey: false
                }));
            }
            if (uploadedTranslation?.id && isUuidV4(uploadedTranslation?.id)) {
                const fountItem = isTypeProduct
                    ? await this.productDefinitionRepo.findOne({ where: { id: uploadedTranslation.id } })
                    : await this.attributeRepo.findOne({ where: { id: uploadedTranslation.id } });

                if (!fountItem) errors.push({ key: 'id', error: 'Invalid id', isShowKey: false });
            }
            if (errors.length) {
                validationErrors.push({
                    index,
                    errors,
                    isShowRow: true
                });
                validatedItemCount--;
            }
        });

        return { totalItems: uploadedTranslations.length, validatedItemCount, validationErrors };
    }

    private readTranslationJsonFile(
        file: Express.Multer.File,
        type: 'Product' | 'Attribute'
    ): UploadProductTranslationItem[] {
        try {
            return JSON.parse(file.buffer.toString('utf8'));
        } catch (error) {
            throw new BadRequestException({
                translate:
                    type === 'Product'
                        ? 'error.invalid_product_translation_file'
                        : 'error.invalid_product_attribute_translation_file'
            });
        }
    }

    async uploadAndValidateProductTranslationFile(
        file: Express.Multer.File
    ): Promise<UploadProductTranslationResponse> {
        const { totalItems, validatedItemCount, validationErrors } = await this.validateTranslationFile(
            file,
            'Product'
        );
        const { blobName } = await this.storageService.uploadFile({
            file: file.buffer,
            fileName: generateUniqueName(file.originalname)
        });
        const productDefinitionFile = await this.productDefinitionFileRepo.save({ blobName, isValidated: true });

        return {
            file: {
                id: productDefinitionFile.id,
                name: file.originalname,
                size: file.size
            },
            totalItems,
            validatedItemCount,
            validationErrors
        };
    }

    async saveProductTranslation(fileId: string): Promise<void> {
        const file = await this.productDefinitionFileRepo.findById(fileId);

        if (!file.isValidated) {
            throw new BadRequestException({ translate: 'error.not_validated_product_translation_upload_file' });
        }

        if (file.isImported) {
            throw new BadRequestException({ translate: 'error.imported_product_translation_upload_file' });
        }

        const fileStream = await this.storageService.getFileStream(file.blobName);
        const uploadedProductDefinitionTranslations: UploadProductTranslationItem = JSON.parse(
            fileStream.read().toString('utf8')
        );

        await Promise.all([
            this.productDefinitionRepo.save(uploadedProductDefinitionTranslations),
            this.productDefinitionFileRepo.update(fileId, { isImported: true })
        ]);
    }

    async uploadAndValidateProductAttributeTranslationFile(
        file: Express.Multer.File
    ): Promise<UploadProductTranslationResponse> {
        const { totalItems, validatedItemCount, validationErrors } = await this.validateTranslationFile(
            file,
            'Attribute'
        );
        const { blobName } = await this.storageService.uploadFile({
            file: file.buffer,
            fileName: generateUniqueName(file.originalname)
        });
        const attributeFile = await this.attributeFileRepo.save({ blobName, isValidated: true });

        return {
            file: {
                id: attributeFile.id,
                name: file.originalname,
                size: file.size
            },
            totalItems,
            validatedItemCount,
            validationErrors
        };
    }

    async saveProductAttributeTranslation(fileId: string): Promise<void> {
        const file = await this.attributeFileRepo.findById(fileId);

        if (!file.isValidated) {
            throw new BadRequestException({ translate: 'error.not_validated_product_translation_upload_file' });
        }

        if (file.isImported) {
            throw new BadRequestException({ translate: 'error.imported_product_translation_upload_file' });
        }

        const fileStream = await this.storageService.getFileStream(file.blobName);
        const uploadedProductDefinitionTranslations: UploadProductTranslationItem = JSON.parse(
            fileStream.read().toString('utf8')
        );

        await Promise.all([
            this.attributeRepo.save(uploadedProductDefinitionTranslations),
            this.attributeFileRepo.update(fileId, { isImported: true })
        ]);
    }
}
