import { ValidExcelQuestionData } from './facility-groups/valid-excel-question-data.type';

export type CalculateFarmRiskScoreParam = {
    farmId: string;
    selfAssessments: ValidExcelQuestionData;
};
