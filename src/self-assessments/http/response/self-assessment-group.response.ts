import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { I18nField } from '~self-assessments/types/i18n-field.type';

export class SelfAssessmentGroupResponse extends BaseEntityResponse {
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
    @IsObject()
    title: I18nField | null;

    @ApiProperty()
    @IsNumber()
    order: number;
}
