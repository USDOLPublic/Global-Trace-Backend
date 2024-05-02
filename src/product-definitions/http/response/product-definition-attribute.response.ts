import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { AttributeResponse } from './attribute.response';

export class ProductDefinitionAttributeResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productDefinitionId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    attributeId: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    order: number;

    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    isAddManuallyOnly: boolean;

    @ApiProperty()
    @IsBoolean()
    isOptional: boolean;

    @ApiProperty({ type: AttributeResponse })
    @ValidateNested()
    @Type(() => AttributeResponse)
    attribute: AttributeResponse;
}
