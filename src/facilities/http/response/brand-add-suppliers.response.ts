import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { FacilityResponse } from './facility.response';
import { UserWithRoleAndPermissionsResponse } from '~users/http/response/user-with-role-and-permissions.response';

export class BrandAddSuppliersResponse extends FacilityResponse {
    @ApiPropertyOptional({ type: UserWithRoleAndPermissionsResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserWithRoleAndPermissionsResponse)
    users?: UserWithRoleAndPermissionsResponse[] | null;
}
