import { PaginationResponse } from '~core/http/response/pagination.response';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RoleWithPermissionsResponse } from './role-with-permissions.response';

export class RolePaginationResponse extends PaginationResponse {
    @ApiProperty({ type: RoleWithPermissionsResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoleWithPermissionsResponse)
    items: RoleWithPermissionsResponse[];
}
