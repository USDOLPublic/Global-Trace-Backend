import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { I18nField } from '~self-assessments/types/i18n-field.type';
import { AttributeOptionResponse } from './attribute-option.response';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';

export class AttributeResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: FieldTypeEnum })
    @IsNotEmpty()
    @IsEnum(FieldTypeEnum)
    type: FieldTypeEnum;

    @ApiProperty({ enum: FieldCategoryEnum })
    @IsNotEmpty()
    @IsEnum(FieldCategoryEnum)
    category: FieldCategoryEnum;

    @ApiProperty()
    @IsNotEmpty()
    @IsObject()
    nameTranslation: I18nField;

    @ApiProperty({ type: AttributeOptionResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttributeOptionResponse)
    options: AttributeOptionResponse[];
}
