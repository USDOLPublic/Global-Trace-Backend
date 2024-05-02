import { AssessmentValidateException } from './assessment-validate.exception';
import { ErrorResultType } from '~core/validators/types/error-result.type';

export class AssessmentValidateAnswerException extends AssessmentValidateException {
    canTranslateError: ErrorResultType;

    constructor(
        questionId: string,
        canTranslateError: ErrorResultType,
        extraInfo?: { itemId?: string; answerIndex?: number }
    ) {
        super(questionId, canTranslateError, AssessmentValidateException.types.answerValueInvalid, extraInfo);
    }
}
