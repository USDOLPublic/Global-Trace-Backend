import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { ManualAddedProductDto } from './manual-added-product-attribute.dto';

export class ManualAddedDataDto {
    @ApiProperty()
    @IsUUID('4')
    @Exists(ProductDefinitionEntity, 'id')
    productDefinitionId: string;

    @ApiProperty({ type: ManualAddedProductDto, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ManualAddedProductDto)
    manualAddedProducts?: ManualAddedProductDto[];
}
