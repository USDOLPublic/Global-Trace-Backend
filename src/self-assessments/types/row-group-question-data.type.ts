export type ResponseOptionsType = {
    responseOptions: string;
    optionType: string;
    goTo: string;
    riskLevel: string;
    indicator: string;
    subIndicator: string;
};

export type RowGroupQuestionDataType = {
    index: number;
    question: string;
    methodCollecting: string;
    conditionalQuestion: string;
    responseType: string;
    responses: ResponseOptionsType[];
};
