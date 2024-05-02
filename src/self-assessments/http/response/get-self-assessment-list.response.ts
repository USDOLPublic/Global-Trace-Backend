import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { SelfAssessmentWithIncompleteQuestionsResponse } from './self-assessment-with-incomplete-questions.response';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SelfAssessmentGroupWithQuestionsResponse } from './self-assessment-group-with-questions.response';

export class GetSelfAssessmentListResponse {
    @ApiProperty({ type: SelfAssessmentWithIncompleteQuestionsResponse })
    @ValidateNested()
    @Type(() => SelfAssessmentWithIncompleteQuestionsResponse)
    selfAssessment: SelfAssessmentWithIncompleteQuestionsResponse;

    @ApiPropertyOptional({ type: SelfAssessmentGroupWithQuestionsResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SelfAssessmentGroupWithQuestionsResponse)
    groups: SelfAssessmentGroupWithQuestionsResponse[] | null;
}
