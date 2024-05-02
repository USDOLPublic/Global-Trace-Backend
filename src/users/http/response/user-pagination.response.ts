import { PaginationResponse } from '~core/http/response/pagination.response';
import { GetUserListResponse } from './get-user-list.response';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserPaginationResponse extends PaginationResponse {
    @ApiProperty({ type: GetUserListResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GetUserListResponse)
    items: GetUserListResponse[];
}
