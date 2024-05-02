import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CalculationItemResponse {
    @ApiProperty()
    @IsBoolean()
    canCalculate: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    value?: number;
}
