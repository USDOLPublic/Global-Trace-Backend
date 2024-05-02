import { ValueTransformer } from 'typeorm';
import { capitalize } from 'lodash';

export class CapitalizeFirstLetterTransform implements ValueTransformer {
    to(value) {
        return capitalize(value);
    }

    from(value) {
        return value;
    }
}
