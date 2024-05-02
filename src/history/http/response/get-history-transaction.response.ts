import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { TransactionResponse } from '~events/http/response/transaction.response';
import { FacilityResponse } from '~facilities/http/response/facility.response';
import { GetHistoryTransactionItemResponse } from './get-history-transaction-item.response';

export class GetHistoryTransactionResponse extends TransactionResponse {
    @ApiPropertyOptional({ type: GetHistoryTransactionItemResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GetHistoryTransactionItemResponse)
    transactionItems: GetHistoryTransactionItemResponse[] | null;

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityResponse)
    fromFacility: FacilityResponse | null;

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityResponse)
    toFacility: FacilityResponse | null;
}
