import { BaseSaqSetting } from '~self-assessments/saq-extra-types/base-saq-setting';

export interface MultipleChoiceSetting extends BaseSaqSetting {
    hasOtherOption: boolean;
}
