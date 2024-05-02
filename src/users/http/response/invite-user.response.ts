import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { FacilityResponse } from '~facilities/http/response/facility.response';
import { PermissionWithSubPermissionsResponse } from '~role-permissions/http/response/permission-with-sub-permissions.response';
import { RoleWithPermissionsResponse } from '~role-permissions/http/response/role-with-permissions.response';
import { UserResponse } from './user.response';

export class InviteUserResponse extends UserResponse {
    @ApiProperty({ type: RoleWithPermissionsResponse })
    @ValidateNested()
    @Type(() => RoleWithPermissionsResponse)
    role: RoleWithPermissionsResponse;

    @ApiProperty({ type: PermissionWithSubPermissionsResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionWithSubPermissionsResponse)
    permissions: PermissionWithSubPermissionsResponse[];

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FacilityResponse)
    facilities: FacilityResponse[] | null;
}
