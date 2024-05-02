import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CoordinateTypeResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    latitude: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    longitude: string;
}
