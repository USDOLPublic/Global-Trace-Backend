import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { PermissionResponse } from './permission.response';

export class PermissionWithSubPermissionsResponse extends PermissionResponse {
    @ApiProperty({ type: PermissionResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionResponse)
    subPermissions: PermissionResponse[];
}
