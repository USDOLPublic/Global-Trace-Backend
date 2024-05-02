import { BaseSaqMetadata } from '~self-assessments/saq-extra-types/base-saq-metadata';
import { ChoiceQuestionMetadata } from '~self-assessments/saq-extra-types/choice-question-metadata';
import { MultipleChoiceSetting } from '~self-assessments/saq-extra-types/multiple-choice-setting';

export interface MultipleChoiceMetadata extends BaseSaqMetadata, MultipleChoiceSetting {
    values: ChoiceQuestionMetadata[];
    onlyValue?: string[];
}
