import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';
import { I18nField } from '~self-assessments/types/i18n-field.type';
import { SaqMetadataType } from '~self-assessments/types/saq-metadata.type';
import { ConditionQuestionResponse } from './condition-question.response';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { QuestionResponse } from './question.response';

export class SelfAssessmentQuestionResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    createdAt: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    updatedAt: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    groupId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    title: I18nField | null;

    @ApiProperty()
    @IsNumber()
    order: number;

    @ApiPropertyOptional({ enum: SelfAssessmentQuestionTypesEnum })
    @IsOptional()
    @IsEnum(SelfAssessmentQuestionTypesEnum)
    type: SelfAssessmentQuestionTypesEnum | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isRequired: boolean | null;

    @ApiPropertyOptional({ type: ConditionQuestionResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConditionQuestionResponse)
    conditions: ConditionQuestionResponse[] | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata: SaqMetadataType | null;

    @ApiPropertyOptional({ type: QuestionResponse, isArray: true })
    @IsOptional()
    @Type(() => QuestionResponse)
    @IsArray()
    @ValidateNested({ each: true })
    questionResponses: QuestionResponse[];
}
