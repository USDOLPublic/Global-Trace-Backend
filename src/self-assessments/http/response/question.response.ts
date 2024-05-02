import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';
import { I18nField } from '~self-assessments/types/i18n-field.type';

export class QuestionResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    selfAssessmentQuestionId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    option: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    optionType: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    nextQuestionId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    goTo: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(SeverityEnum)
    riskLevel: SeverityEnum | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    indicatorId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    subIndicatorId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    translation: I18nField | null;
}
