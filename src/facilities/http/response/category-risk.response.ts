import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CategoryResponse } from '~categories/http/response/category.response';
import { IndicatorRiskResponse } from './indicator-risk.response';
import { RiskResponse } from './risk.response';
import { SourceRiskResponse } from './source-risk.response';

export class CategoryRiskResponse {
    @ApiPropertyOptional({ type: CategoryResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => CategoryResponse)
    category?: CategoryResponse | null;

    @ApiProperty({ type: RiskResponse })
    @ValidateNested()
    @Type(() => RiskResponse)
    risk: RiskResponse;

    @ApiProperty({ type: IndicatorRiskResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IndicatorRiskResponse)
    indicatorRiskData: IndicatorRiskResponse[];

    @ApiProperty({ type: SourceRiskResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SourceRiskResponse)
    sourceRiskData: SourceRiskResponse[];
}
