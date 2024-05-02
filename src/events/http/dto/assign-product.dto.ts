import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { ProductEntity } from '~products/entities/product.entity';
import { OutputProductDataDto } from './output-product-data.dto';

export class AssignProductDto {
    @ApiPropertyOptional({ type: 'string', isArray: true, description: 'Product IDs' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @Exists(
        ProductEntity,
        'id',
        false,
        [
            {
                value: false,
                exclude: false,
                column: 'isTransformed'
            }
        ],
        { each: true, message: 'invalid_assigned_product_id' }
    )
    inputProductIds?: string[];

    @ApiProperty({ type: OutputProductDataDto })
    @ValidateNested()
    @Type(() => OutputProductDataDto)
    outputProduct: OutputProductDataDto;
}
