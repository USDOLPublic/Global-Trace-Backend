import { BaseSaqMetadata } from '~self-assessments/saq-extra-types/base-saq-metadata';
import { InputRuleMetadata } from '~self-assessments/saq-extra-types/input-rule-metadata';

export interface BaseFormInputMetadata extends BaseSaqMetadata {
    label?: string;
    answerValueValidateSchema?: InputRuleMetadata[];
}
