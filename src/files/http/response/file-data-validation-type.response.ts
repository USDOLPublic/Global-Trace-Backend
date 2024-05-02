import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { FileValidationErrorResponse } from './file-validation-error.response';

export class FileDataValidationTypeResponse {
    @ApiProperty()
    @IsNumber()
    index: number;

    @ApiPropertyOptional({ type: FileValidationErrorResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FileValidationErrorResponse)
    errors: FileValidationErrorResponse[] | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sheet?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isShowRow: boolean;
}
