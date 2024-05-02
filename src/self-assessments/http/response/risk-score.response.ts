import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';
import { RiskScoreTypeEnum } from '~self-assessments/enums/risk-score-type.enum';

export class RiskScoreResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    selfAssessmentId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    groupId: string | null;

    @ApiProperty()
    @IsNumber()
    riskScore: number;

    @ApiProperty({ enum: RiskScoreTypeEnum })
    @IsEnum(RiskScoreTypeEnum)
    type: RiskScoreTypeEnum;

    @ApiProperty({ enum: RiskScoreLevelEnum })
    @IsEnum(RiskScoreLevelEnum)
    level: RiskScoreLevelEnum;
}
