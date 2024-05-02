import moment from 'moment';
import { ValueTransformer } from 'typeorm';
import { DATE_FORMAT } from '~facilities/constants/farm-group-template.constants';

export class DateTransformer implements ValueTransformer {
    to(value) {
        if (!value) {
            return value;
        }

        return moment(value, DATE_FORMAT).format('MM/DD/YYYY');
    }

    from(value) {
        if (!value) {
            return value;
        }
        return moment(value).format(DATE_FORMAT);
    }
}
