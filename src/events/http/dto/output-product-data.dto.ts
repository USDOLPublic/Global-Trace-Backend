import { Exists } from '@diginexhk/nestjs-base-decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { OutputProductDto } from './output-product.dto';

export class OutputProductDataDto {
    @ApiProperty()
    @IsUUID('4')
    @Exists(ProductDefinitionEntity, 'id')
    productDefinitionId: string;

    @ApiProperty({ type: OutputProductDto, isArray: true })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => OutputProductDto)
    outputProducts: OutputProductDto[];
}
