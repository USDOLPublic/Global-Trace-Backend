import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Exists } from '~core/http/validators/exists.validator';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';

export class AnswerValueDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    value: string = null;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(SelfAssessmentQuestionResponseEntity, 'id')
    selfAssessmentQuestionResponseId: string;
}
export class AnswerDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(SelfAssessmentQuestionEntity, 'id')
    selfAssessmentQuestionId: string;

    @ApiProperty({ type: [AnswerValueDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerValueDto)
    answerValues: AnswerValueDto[];
}

export class AnswerSelfAssessmentDto {
    @ApiProperty({ type: [AnswerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
