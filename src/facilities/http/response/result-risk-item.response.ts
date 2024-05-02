import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RiskResponse } from './risk.response';

export class ResultRiskItemResponse {
    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    createdAt: Date | number | null;

    @ApiProperty()
    @IsString()
    source: string;

    @ApiProperty({ type: RiskResponse })
    @ValidateNested()
    @Type(() => RiskResponse)
    risk: RiskResponse;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    note?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    roleId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isIndirect?: boolean;
}
