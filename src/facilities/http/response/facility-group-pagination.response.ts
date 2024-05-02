import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { PaginationResponse } from '~core/http/response/pagination.response';
import { GetFacilityGroupListResponse } from './get-facility-group-list.response';

export class FacilityGroupPaginationResponse extends PaginationResponse {
    @ApiProperty({ type: GetFacilityGroupListResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GetFacilityGroupListResponse)
    items: GetFacilityGroupListResponse[];
}
