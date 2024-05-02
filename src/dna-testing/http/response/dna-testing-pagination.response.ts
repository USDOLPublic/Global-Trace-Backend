import { PaginationResponse } from '~core/http/response/pagination.response';
import { GetDnaTestingListResponse } from './get-dna-testing-list.response';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DnaTestingPaginationResponse extends PaginationResponse {
    @ApiProperty({ type: GetDnaTestingListResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GetDnaTestingListResponse)
    items: GetDnaTestingListResponse[];
}
