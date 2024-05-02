import { ValueTransformer } from 'typeorm';
import { StorageService } from '@diginexhk/nestjs-storage';
import { isArray, isString } from 'lodash';

export class ProofUrlTransformer implements ValueTransformer {
    to(value) {
        return value;
    }

    from(value: string | string[] | null) {
        if (isArray(value)) {
            return value.map((proof) => StorageService.instance.getFileUrl(proof));
        } else if (isString(value)) {
            return StorageService.instance.getFileUrl(value);
        }

        return null;
    }
}
