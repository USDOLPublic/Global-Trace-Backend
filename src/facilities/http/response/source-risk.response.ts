import { ApiProperty } from '@nestjs/swagger';
import { RiskResponse } from './risk.response';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SourceRiskResponse {
    @ApiProperty()
    @IsString()
    source: string;

    @ApiProperty({ type: RiskResponse })
    @ValidateNested()
    @Type(() => RiskResponse)
    risk: RiskResponse;
}
