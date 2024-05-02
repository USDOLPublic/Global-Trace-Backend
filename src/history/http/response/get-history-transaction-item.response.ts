import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { TransactedProductResponse } from '~events/http/response/transacted-product.response';
import { TransactionItemResponse } from '~events/http/response/transaction-item.response';

export class GetHistoryTransactionItemResponse extends TransactionItemResponse {
    @ApiPropertyOptional({ type: TransactedProductResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => TransactedProductResponse)
    product: TransactedProductResponse | null;
}
