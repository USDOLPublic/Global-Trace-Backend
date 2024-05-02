import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export class RiskResponse {
    @ApiPropertyOptional()
    @IsOptional()
    // @IsNumber()
    score?: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(RiskScoreLevelEnum)
    level?: RiskScoreLevelEnum;
}
