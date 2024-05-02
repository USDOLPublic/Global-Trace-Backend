import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RoleResponse } from '~role-permissions/http/response/role.response';
import { UserResponse } from './user.response';

export class UserWithRoleResponse extends UserResponse {
    @ApiProperty({ type: RoleResponse })
    @ValidateNested()
    @Type(() => RoleResponse)
    role: RoleResponse;
}
