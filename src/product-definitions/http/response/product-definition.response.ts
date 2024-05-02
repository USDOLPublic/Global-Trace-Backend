import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { I18nField } from '~self-assessments/types/i18n-field.type';
import { ProductDefinitionAttributeResponse } from './product-definition-attribute.response';

export class ProductDefinitionResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsObject()
    nameTranslation: I18nField;

    @ApiPropertyOptional({ type: ProductDefinitionAttributeResponse })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductDefinitionAttributeResponse)
    productDefinitionAttributes: ProductDefinitionAttributeResponse[] | null;
}
