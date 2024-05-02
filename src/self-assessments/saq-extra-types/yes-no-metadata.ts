import { SingleChoiceMetadata } from '~self-assessments/saq-extra-types/single-choice-metadata';
import { YesNoSetting } from '~self-assessments/saq-extra-types/yes-no-setting';

export interface YesNoMetadata extends SingleChoiceMetadata, YesNoSetting {}
