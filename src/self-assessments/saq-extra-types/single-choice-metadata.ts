import { BaseSaqMetadata } from '~self-assessments/saq-extra-types/base-saq-metadata';
import { ChoiceQuestionMetadata } from '~self-assessments/saq-extra-types/choice-question-metadata';
import { SpecificListMetadata } from '~self-assessments/saq-extra-types/specific-list-metadata';
import { SingleChoiceSetting } from '~self-assessments/saq-extra-types/single-choice-setting';

export interface SingleChoiceMetadata extends BaseSaqMetadata, SpecificListMetadata, SingleChoiceSetting {
    values: ChoiceQuestionMetadata[];
    code?: string; // worker code
}
