import { ApiPropertyOptional } from '@nestjs/swagger';
import { FacilityResponse } from './facility.response';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { FacilityPartnerResponse } from './facility-partner.response';
import { UserResponse } from '~users/http/response/user.response';

export class BrandGetSupplierListResponse extends FacilityResponse {
    @ApiPropertyOptional({ type: UserResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResponse)
    users?: UserResponse[] | null;

    @ApiPropertyOptional({ type: FacilityPartnerResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityPartnerResponse)
    facilityPartners?: FacilityPartnerResponse[] | null;
}
