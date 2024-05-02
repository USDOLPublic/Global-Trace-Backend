import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelfAssessmentResponse } from './self-assessment.response';
import { IsArray, IsNumber, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RiskScoreWithGroupResponse } from './risk-score-with-group.response';

export class SelfAssessmentWithRiskScoresGroupResponse extends SelfAssessmentResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    id: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    createdAt: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    updatedAt: number | null;

    @ApiPropertyOptional({ type: RiskScoreWithGroupResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RiskScoreWithGroupResponse)
    riskScores: RiskScoreWithGroupResponse[] | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    countryLaborRiskScore: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    provinceLaborRiskScore: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    districtLaborRiskScore: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    riskAssessmentScore: number | null;
}
