import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CategoryResponse } from '~categories/http/response/category.response';
import { RiskResponse } from './risk.response';
import { SubIndicatorRiskResponse } from './sub-indicator-risk.response';

export class IndicatorRiskResponse {
    @ApiProperty({ type: CategoryResponse })
    @ValidateNested()
    @Type(() => CategoryResponse)
    indicator: CategoryResponse;

    @ApiProperty({ type: RiskResponse })
    @ValidateNested()
    @Type(() => RiskResponse)
    risk: RiskResponse;

    @ApiProperty({ type: SubIndicatorRiskResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubIndicatorRiskResponse)
    subIndicatorRiskData: SubIndicatorRiskResponse[];
}
