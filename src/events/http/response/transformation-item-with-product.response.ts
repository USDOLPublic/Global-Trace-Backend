import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { TransactedProductResponse } from './transacted-product.response';
import { TransformationItemResponse } from './transformation-item.response';

export class TransformationItemWithProductResponse extends TransformationItemResponse {
    @ApiPropertyOptional({ type: TransactedProductResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => TransactedProductResponse)
    product: TransactedProductResponse | null;
}
