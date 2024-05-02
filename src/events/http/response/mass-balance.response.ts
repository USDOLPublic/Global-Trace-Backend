import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class MassBalanceResponse {
    @ApiProperty()
    @IsBoolean()
    canCalculate: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    verifiedQuantity?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    notVerifiedQuantity?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    lastUpdatedAt?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    quantityUnit?: string;
}
