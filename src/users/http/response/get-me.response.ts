import { RoleWithPermissionsResponse } from '~role-permissions/http/response/role-with-permissions.response';
import { UserResponse } from './user.response';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionResponse } from '~role-permissions/http/response/permission.response';
import { FacilityResponse } from '~facilities/http/response/facility.response';

export class GetMeResponse extends UserResponse {
    @ApiProperty({ type: RoleWithPermissionsResponse })
    @ValidateNested()
    @Type(() => RoleWithPermissionsResponse)
    role: RoleWithPermissionsResponse;

    @ApiProperty({ type: PermissionResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionResponse)
    permissions: PermissionResponse[];

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityResponse)
    currentFacility: FacilityResponse | null;

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FacilityResponse)
    facilities: FacilityResponse[] | null;
}
