import {
    IsArray,
    IsBoolean,
    IsDefined,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateIf,
    ValidateNested
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';
import { Exists } from '~core/http/validators/exists.validator';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { I18nFieldMetadataType } from '~self-assessments/types/i18n-field-metadata.type';
import { RiskScoreQuestionTypeEnum } from '~self-assessments/enums/risk-score-question-type.enum';

export class AnswerValueDto {
    @ApiProperty()
    @IsNotEmpty()
    value: I18nFieldMetadataType;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    code: string;

    @ApiProperty({ enum: RiskScoreLevelEnum, required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsEnum(RiskScoreLevelEnum)
    traceabilityRiskLevel?: RiskScoreLevelEnum;

    @ApiProperty({ enum: RiskScoreLevelEnum, required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsEnum(RiskScoreLevelEnum)
    laborRiskLevel?: RiskScoreLevelEnum;

    @ApiProperty({ required: false })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    laborRiskType?: string;
}

export class AnswerDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID('4')
    answerId?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(SelfAssessmentQuestionEntity, 'id')
    questionId: string;

    @ApiProperty({ type: [AnswerValueDto] })
    @IsDefined()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerValueDto)
    @ValidateIf((object, value) => value !== null)
    answerValues: AnswerValueDto[];

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isDelete: boolean;

    @ApiProperty({ enum: RiskScoreQuestionTypeEnum, required: false })
    @ValidateIf((object, value) => value)
    @IsOptional()
    @IsEnum(RiskScoreQuestionTypeEnum)
    multiChoiceType?: RiskScoreQuestionTypeEnum;
}

export class AnswerAssessmentDto {
    @ApiProperty({ type: [AnswerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
