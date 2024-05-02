import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransformationResponse } from './transformation.response';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransformationItemWithProductResponse } from './transformation-item-with-product.response';

export class TransformationWithTransformationItemsResponse extends TransformationResponse {
    @ApiPropertyOptional({ type: TransformationItemWithProductResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TransformationItemWithProductResponse)
    transformationItems: TransformationItemWithProductResponse[] | null;
}
