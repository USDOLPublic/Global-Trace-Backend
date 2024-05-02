import { FreeInputValueMetadata } from '~self-assessments/saq-extra-types/free-input-value-metadata';

export interface NumberMetadata extends FreeInputValueMetadata {
    values?: FreeInputValueMetadata[];
}
