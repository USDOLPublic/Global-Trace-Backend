import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { PaginationResponse } from '~core/http/response/pagination.response';
import { GetHistoryResponse } from './get-history.response';

export class HistoryPagination extends PaginationResponse {
    @ApiProperty({ type: GetHistoryResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GetHistoryResponse)
    items: GetHistoryResponse[];
}
