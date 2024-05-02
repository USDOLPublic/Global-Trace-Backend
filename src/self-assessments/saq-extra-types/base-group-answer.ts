export interface BaseGroupAnswer {
    subQuestionId: string;
    answerValue: {
        value: any;
        files?: string[];
    };
}
