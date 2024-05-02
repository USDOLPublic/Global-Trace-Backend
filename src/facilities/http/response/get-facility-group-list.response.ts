import { ApiPropertyOptional } from '@nestjs/swagger';
import { FacilityResponse } from './facility.response';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FarmGroupAdditionalInformationResponse } from './facility-additional-information.response';

export class GetFacilityGroupListResponse extends FacilityResponse {
    @ApiPropertyOptional({ type: FarmGroupAdditionalInformationResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FarmGroupAdditionalInformationResponse)
    additionalInformation: FarmGroupAdditionalInformationResponse;
}
