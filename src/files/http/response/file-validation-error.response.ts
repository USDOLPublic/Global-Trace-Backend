import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FileValidationErrorResponse {
    @ApiProperty()
    @IsString()
    key: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    error: string;

    @ApiPropertyOptional()
    currentValue: any;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isBlankRow: boolean | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isShowKey?: boolean | null;
}
