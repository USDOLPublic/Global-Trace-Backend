import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { UploadProductTranslationFileResponse } from './upload-product-translation-file.response';
import { UploadProductTranslationValidationResponse } from './upload-product-translation-validation.response';

export class UploadProductTranslationResponse {
    @ApiPropertyOptional({ type: UploadProductTranslationFileResponse })
    @ValidateNested()
    @Type(() => UploadProductTranslationFileResponse)
    file: UploadProductTranslationFileResponse;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    totalItems: number;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    validatedItemCount: number;

    @ApiPropertyOptional({ type: UploadProductTranslationValidationResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UploadProductTranslationValidationResponse)
    validationErrors: UploadProductTranslationValidationResponse[] | null;
}
