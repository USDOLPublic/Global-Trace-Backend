import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RoleResponse } from '~role-permissions/http/response/role.response';
import { IsArray, ValidateNested } from 'class-validator';
import { PermissionResponse } from '~role-permissions/http/response/permission.response';
import { UserResponse } from '~users/http/response/user.response';

export class PartnerResponse extends UserResponse {
    @ApiProperty({ type: RoleResponse })
    @ValidateNested()
    @Type(() => RoleResponse)
    role: RoleResponse;

    @ApiProperty({ type: PermissionResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionResponse)
    permissions: PermissionResponse[];
}
