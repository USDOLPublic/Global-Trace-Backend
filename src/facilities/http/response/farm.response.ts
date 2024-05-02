import { IsOptional, ValidateNested } from 'class-validator';
import { FacilityResponse } from './facility.response';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SelfAssessmentResponse } from '~self-assessments/http/response/self-assessment.response';
import { FarmGroupAdditionalInformationResponse } from './facility-additional-information.response';

export class FarmResponse extends FacilityResponse {
    @ApiPropertyOptional({ type: SelfAssessmentResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => SelfAssessmentResponse)
    selfAssessment: SelfAssessmentResponse | null;

    @ApiPropertyOptional({ type: FarmGroupAdditionalInformationResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FarmGroupAdditionalInformationResponse)
    additionalInformation: FarmGroupAdditionalInformationResponse | null;
}
