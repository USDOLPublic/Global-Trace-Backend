import { ErrorResultType } from '~core/validators/types/error-result.type';

export class AssessmentValidateException extends Error {
    static types = {
        required: 'required',
        answerValueInvalid: 'answerValueInvalid'
    };

    type: string;

    questionId: string;

    answerIndex: number;

    itemId: string;

    canTranslateError: ErrorResultType;

    constructor(
        questionId: string,
        canTranslateError: ErrorResultType,
        type: string,
        extraInfo?: { itemId?: string; answerIndex?: number }
    ) {
        super(canTranslateError?.translate);
        this.type = type;
        this.questionId = questionId;
        this.itemId = extraInfo?.itemId;
        this.answerIndex = extraInfo?.answerIndex;
        this.canTranslateError = canTranslateError;
    }
}
