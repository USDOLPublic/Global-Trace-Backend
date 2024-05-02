import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiskScoreResponse } from './risk-score.response';
import { SelfAssessmentResponse } from './self-assessment.response';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SelfAssessmentWithRiskScoresResponse extends SelfAssessmentResponse {
    @ApiPropertyOptional({ type: RiskScoreResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RiskScoreResponse)
    riskScores: RiskScoreResponse[] | null;
}
