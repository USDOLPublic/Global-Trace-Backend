import { ApiPropertyOptional } from '@nestjs/swagger';
import { UploadProductTranslationValidationResponse } from '~product-definitions/http/response/upload-product-translation-validation.response';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SelfAssessmentQuestionResponse } from './self-assessment-question.response';
import { QuestionResponse } from './question.response';

export class SelfAssessmentTranslationResponse {
    @ApiPropertyOptional({ type: SelfAssessmentQuestionResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SelfAssessmentQuestionResponse)
    updatedQuestionTranslations: SelfAssessmentQuestionResponse[];

    @ApiPropertyOptional({ type: QuestionResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionResponse)
    updatedQuestionResponseTranslations: QuestionResponse[];

    @ApiPropertyOptional({ type: UploadProductTranslationValidationResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UploadProductTranslationValidationResponse)
    validationErrors: UploadProductTranslationValidationResponse[];
}
