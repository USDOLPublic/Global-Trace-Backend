export type RiskScoreTracingGroup = {
    type: string;
    questionId: string;
    status: string;
    conditionType?: string;
    conditions?: { questionId: string; codes: string[] }[];
};
