import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { FileDataValidationTypeResponse } from './file-data-validation-type.response';
import { Type } from 'class-transformer';

export class UploadTemplateResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    fileId: string | null;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    totalItems: number;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    validatedItemCount: number;

    @ApiPropertyOptional({ type: FileDataValidationTypeResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FileDataValidationTypeResponse)
    validationErrors: FileDataValidationTypeResponse[] | null;
}
