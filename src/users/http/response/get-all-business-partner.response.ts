import { FacilityResponse } from '~facilities/http/response/facility.response';
import { UserResponse } from './user.response';
import { FacilityPartnerResponse } from '~facilities/http/response/facility-partner.response';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAllBusinessPartnerResponse extends FacilityResponse {
    @ApiPropertyOptional({ type: UserResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResponse)
    users: UserResponse[] | null;

    @ApiPropertyOptional({ type: FacilityPartnerResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityPartnerResponse)
    partnerFacilities: FacilityPartnerResponse[] | null;
}
