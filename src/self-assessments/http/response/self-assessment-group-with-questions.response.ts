import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { SelfAssessmentGroupResponse } from './self-assessment-group.response';
import { SelfAssessmentQuestionResponse } from './self-assessment-question.response';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SelfAssessmentGroupWithQuestionsResponse extends SelfAssessmentGroupResponse {
    @ApiPropertyOptional({ type: SelfAssessmentQuestionResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SelfAssessmentQuestionResponse)
    questions: SelfAssessmentQuestionResponse[] | null;
}
