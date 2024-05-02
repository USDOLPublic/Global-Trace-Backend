import { EventResponse } from './event.response';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransformationWithTransformationItemsResponse } from '~events/http/response/transformation-with-transformation-items.response';
import { RecordProductResponse } from '~events/http/response/record-product.response';
import { GetHistoryTransactionResponse } from './get-history-transaction.response';

export class GetHistoryResponse extends EventResponse {
    @ApiPropertyOptional({ type: GetHistoryTransactionResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => GetHistoryTransactionResponse)
    transaction?: GetHistoryTransactionResponse | null;

    @ApiPropertyOptional({ type: TransformationWithTransformationItemsResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => TransformationWithTransformationItemsResponse)
    transformation?: TransformationWithTransformationItemsResponse | null;

    @ApiPropertyOptional({ type: RecordProductResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => RecordProductResponse)
    recordProduct?: RecordProductResponse | null;
}
