import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export class RiskLevelTypeResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    overallRiskScore: number | null;

    @ApiPropertyOptional({
        enum: RiskScoreLevelEnum
    })
    @IsOptional()
    @IsEnum(RiskScoreLevelEnum)
    overallRiskLevel: RiskScoreLevelEnum | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    laborRiskScore: number;

    @ApiPropertyOptional({
        enum: RiskScoreLevelEnum
    })
    @IsOptional()
    @IsEnum(RiskScoreLevelEnum)
    laborRiskLevel: RiskScoreLevelEnum | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    productRiskScore?: number | null;

    @ApiPropertyOptional({
        enum: RiskScoreLevelEnum
    })
    @IsOptional()
    @IsEnum(RiskScoreLevelEnum)
    productRiskLevel?: RiskScoreLevelEnum | null;
}
