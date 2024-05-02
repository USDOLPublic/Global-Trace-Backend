import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { UploadProductTranslationErrorResponse } from './upload-product-translation-error.response';

export class UploadProductTranslationValidationResponse {
    @ApiProperty()
    @IsNumber()
    index: number;

    @ApiPropertyOptional({ type: UploadProductTranslationErrorResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UploadProductTranslationErrorResponse)
    errors: UploadProductTranslationErrorResponse[] | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isShowRow: boolean;
}
