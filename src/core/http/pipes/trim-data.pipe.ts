import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { isArray, isPlainObject, isString, mapValues } from 'lodash';

@Injectable()
export class TrimDataPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        return this.trimDeep(value);
    }

    trimDeep(data: any): any {
        switch (true) {
            case isArray(data):
                return data.map((it) => this.trimDeep(it));
            case isPlainObject(data):
                return mapValues(data, (value) => this.trimDeep(value));
            case isString(data):
                return data.trim();
            default:
                return data;
        }
    }
}
