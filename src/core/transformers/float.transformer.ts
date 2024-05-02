import { isNil } from 'lodash';
import { ValueTransformer } from 'typeorm';

export class FloatTransformer implements ValueTransformer {
    to(value) {
        return value;
    }

    from(value) {
        if (isNil(value)) {
            return value;
        }
        return parseFloat(value);
    }
}
