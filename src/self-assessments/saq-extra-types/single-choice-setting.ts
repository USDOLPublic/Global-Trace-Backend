import { BaseSaqSetting } from '~self-assessments/saq-extra-types/base-saq-setting';

export interface SingleChoiceSetting extends BaseSaqSetting {
    hasNotApplicable: boolean;
}
