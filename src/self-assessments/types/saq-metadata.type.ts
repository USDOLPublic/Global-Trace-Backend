import { SingleChoiceMetadata } from '~self-assessments/saq-extra-types/single-choice-metadata';
import { MultipleChoiceMetadata } from '~self-assessments/saq-extra-types/multiple-choice-metadata';
import { YesNoMetadata } from '~self-assessments/saq-extra-types/yes-no-metadata';
import { ShortTextMetadata } from '~self-assessments/saq-extra-types/short-text-metadata';
import { NumberMetadata } from '~self-assessments/saq-extra-types/number-metadata';

export type ChoiceMetadataType = SingleChoiceMetadata | MultipleChoiceMetadata | YesNoMetadata;

export type FreeInputMetadataType = ShortTextMetadata | NumberMetadata;

export type SaqMetadataType = ChoiceMetadataType | FreeInputMetadataType;
