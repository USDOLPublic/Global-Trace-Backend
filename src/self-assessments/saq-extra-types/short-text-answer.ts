import { BaseSaqAnswer } from '~self-assessments/saq-extra-types/base-saq-answer';

export interface ShortTextAnswer extends BaseSaqAnswer {
    value: string;
}
