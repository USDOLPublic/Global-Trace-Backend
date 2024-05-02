import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SelfAssessmentGroupWithQuestionsResponse } from './self-assessment-group-with-questions.response';
import { SelfAssessmentResponse } from './self-assessment.response';
import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SelfAssessmentWithIncompleteQuestionsResponse extends SelfAssessmentResponse {
    @ApiPropertyOptional({ type: SelfAssessmentGroupWithQuestionsResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SelfAssessmentGroupWithQuestionsResponse)
    incompleteQuestions: SelfAssessmentGroupWithQuestionsResponse[] | null;

    @ApiProperty()
    @IsBoolean()
    isDraft: boolean;
}
