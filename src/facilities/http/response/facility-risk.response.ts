import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { RiskResponse } from './risk.response';
import { CategoryRiskResponse } from './category-risk.response';

export class FacilityRiskResponse {
    @ApiProperty({
        type: RiskResponse
    })
    @ValidateNested()
    @Type(() => RiskResponse)
    overallRisk: RiskResponse;

    @ApiProperty({
        type: RiskResponse
    })
    @ValidateNested()
    @Type(() => RiskResponse)
    countryRisk: RiskResponse;

    @ApiPropertyOptional({
        type: CategoryRiskResponse,
        isArray: true
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CategoryRiskResponse)
    data: CategoryRiskResponse[];
}
