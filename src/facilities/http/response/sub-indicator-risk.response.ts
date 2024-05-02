import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CategoryResponse } from '~categories/http/response/category.response';
import { RiskResponse } from './risk.response';
import { ResultRiskItemResponse } from './result-risk-item.response';

export class SubIndicatorRiskResponse {
    @ApiProperty({ type: CategoryResponse })
    @ValidateNested()
    @Type(() => CategoryResponse)
    subIndicator: CategoryResponse;

    @ApiProperty({ type: RiskResponse })
    @ValidateNested()
    @Type(() => RiskResponse)
    risk: RiskResponse;

    @ApiProperty({ type: ResultRiskItemResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ResultRiskItemResponse)
    data: ResultRiskItemResponse[];
}
