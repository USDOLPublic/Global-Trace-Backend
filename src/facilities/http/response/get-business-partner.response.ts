import { ApiPropertyOptional } from '@nestjs/swagger';
import { FacilityResponse } from './facility.response';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserWithRoleResponse } from '~users/http/response/user-with-role.response';

export class GetBusinessPartnerResponse extends FacilityResponse {
    @ApiPropertyOptional({ type: UserWithRoleResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserWithRoleResponse)
    users: UserWithRoleResponse[] | null;
}
