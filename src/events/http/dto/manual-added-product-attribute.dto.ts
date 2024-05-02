import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ManualAddedAttributeDto } from './manual-added-attribute.dto';

export class ManualAddedProductDto {
    @ApiProperty({ type: ManualAddedAttributeDto, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ManualAddedAttributeDto)
    attributes: ManualAddedAttributeDto[];
}
