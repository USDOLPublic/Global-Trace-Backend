import { BaseSaqAnswer } from '~self-assessments/saq-extra-types/base-saq-answer';

export interface SingleChoiceAnswer extends BaseSaqAnswer {
    value: string;
}
