import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { PermissionWithSubPermissionsResponse } from './permission-with-sub-permissions.response';
import { RoleResponse } from './role.response';

export class GetAllRolesResponse extends RoleResponse {
    @ApiProperty()
    @IsInt()
    numOfPermissions: number;

    @ApiProperty()
    @IsInt()
    totalPermissions: number;

    @ApiPropertyOptional({ type: PermissionWithSubPermissionsResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => PermissionWithSubPermissionsResponse)
    permissions: PermissionWithSubPermissionsResponse[];
}
