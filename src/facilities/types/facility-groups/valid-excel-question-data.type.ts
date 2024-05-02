import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';

export type ExcelQuestionData = {
    column: string;
    value: string;
    type: SelfAssessmentQuestionTypesEnum;
    groupId: string;
    options: string[];
    questionResponses: SelfAssessmentQuestionResponseEntity[];
};

export type ValidExcelQuestionData = Record<string, ExcelQuestionData>;
