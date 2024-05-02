import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiskScoreResponse } from './risk-score.response';
import { SelfAssessmentGroupResponse } from './self-assessment-group.response';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RiskScoreWithGroupResponse extends RiskScoreResponse {
    @ApiPropertyOptional({ type: SelfAssessmentGroupResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => SelfAssessmentGroupResponse)
    group: SelfAssessmentGroupResponse | null;
}
