import { ValidateException } from '@diginexhk/nestjs-exception';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { CreateAttributeDto } from '~product-definitions/http/dto/create-attribute.dto';
import { AttributeRepository } from '~product-definitions/repositories/attribute.repository';

@Injectable()
export class AttributeService {
    public constructor(private attributeRepo: AttributeRepository) {}

    find(options: FindManyOptions<AttributeEntity>): Promise<AttributeEntity[]> {
        return this.attributeRepo.find(options);
    }

    findById(id: string): Promise<AttributeEntity> {
        return this.attributeRepo.findById(id);
    }

    findOne(options: FindOneOptions<AttributeEntity>): Promise<AttributeEntity> {
        return this.attributeRepo.findOne(options);
    }

    all(): Promise<AttributeEntity[]> {
        return this.attributeRepo.find();
    }

    create(data: CreateAttributeDto): Promise<AttributeEntity> {
        const attributeData = this.convertToAttributeData(data);
        return this.attributeRepo.createOne(attributeData);
    }

    async update(id: string, data: CreateAttributeDto): Promise<AttributeEntity> {
        const attributeData = this.convertToAttributeData(data);
        await this.attributeRepo.update(id, attributeData);
        return this.findById(id);
    }

    private convertToAttributeData({ options, name, type, category }: CreateAttributeDto): Partial<AttributeEntity> {
        this.validateAttributeData(type, category);
        const values = options?.map(({ value }) => value);

        if (values && new Set(values).size !== values.length) {
            throw new ValidateException([
                {
                    property: 'value',
                    constraints: {
                        invalidField: {
                            message: 'the_value_is_duplicate',
                            detail: {}
                        } as any
                    }
                }
            ]);
        }

        return {
            name,
            type,
            category,
            nameTranslation: { en: name },
            options: options?.map(({ value }) => ({
                value,
                translation: {
                    en: value
                }
            }))
        };
    }

    private validateAttributeData(type: FieldTypeEnum, category: FieldCategoryEnum): void {
        if (
            (type === FieldTypeEnum.PRODUCT_ID && category !== FieldCategoryEnum.TEXT) ||
            (type === FieldTypeEnum.PRODUCT_QUANTITY && category !== FieldCategoryEnum.NUMBER_UNIT_PAIR)
        ) {
            throw new BadRequestException({ translate: 'error.attribute_type_or_attribute_category_invalid' });
        }
    }

    async delete(id: string) {
        return this.attributeRepo.delete(id);
    }
}
