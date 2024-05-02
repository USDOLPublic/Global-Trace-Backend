import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { FacilityResponse } from '~facilities/http/response/facility.response';
import { RoleWithPermissionsResponse } from '~role-permissions/http/response/role-with-permissions.response';
import { UserResponse } from './user.response';

export class GetUserListResponse extends UserResponse {
    @ApiProperty({ type: RoleWithPermissionsResponse })
    @ValidateNested()
    @Type(() => RoleWithPermissionsResponse)
    role: RoleWithPermissionsResponse;

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityResponse)
    facilities: FacilityResponse[] | null;

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityResponse)
    currentFacility: FacilityResponse | null;
}
