import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { PermissionWithSubPermissionsResponse } from './permission-with-sub-permissions.response';
import { RoleResponse } from './role.response';

export class RoleWithPermissionsResponse extends RoleResponse {
    @ApiProperty({ type: PermissionWithSubPermissionsResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionWithSubPermissionsResponse)
    permissions: PermissionWithSubPermissionsResponse[] | null;
}
