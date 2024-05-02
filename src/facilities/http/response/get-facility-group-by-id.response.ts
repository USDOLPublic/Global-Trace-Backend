import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { FarmResponse } from './farm.response';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FacilityResponse } from './facility.response';
import { SelfAssessmentResponse } from '~self-assessments/http/response/self-assessment.response';
import { FarmGroupAdditionalInformationResponse } from './facility-additional-information.response';

export class GetFacilityGroupByIdResponse extends FacilityResponse {
    @ApiPropertyOptional({ type: FarmGroupAdditionalInformationResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FarmGroupAdditionalInformationResponse)
    additionalInformation: FarmGroupAdditionalInformationResponse;

    @ApiPropertyOptional({ type: FarmResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FarmResponse)
    farms: FarmResponse[] | null;

    @ApiPropertyOptional({ type: SelfAssessmentResponse })
    @ValidateNested()
    @Type(() => SelfAssessmentResponse)
    selfAssessment: SelfAssessmentResponse | null;
}
