import { FreeInputValueMetadata } from '~self-assessments/saq-extra-types/free-input-value-metadata';

export interface ShortTextMetadata extends FreeInputValueMetadata {
    values?: FreeInputValueMetadata[];
}
