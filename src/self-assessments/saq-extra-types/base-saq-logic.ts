export interface BaseSaqLogic {
    existCriteria?: { questionId: string; oneOfValues: string[] };
    requiredCriteria?: { questionId: string; oneOfValues: string[] };
    dependQuestions?: { questionId: string; oneOfValues: string[] }[];
    isIgnoreRiskScore?: boolean;
}
