import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';
import { CustomCheckDateFromTo } from '~core/interfaces/custom-check-date-from-to';
import moment from 'moment';
import { IsEqualOrLongerThanValidator } from '~core/http/validators/is-equal-or-longer-than.validator';

@ValidatorConstraint({ async: true })
export class IsEqualOrLessThanValidator implements ValidatorConstraintInterface {
    async validate(propertyValue: number, args: ValidationArguments) {
        const toDate = await IsEqualOrLongerThanValidator.getDateValue(args.constraints[0], args.object);
        if (!toDate) {
            return true;
        }
        return moment(propertyValue).isSameOrBefore(toDate);
    }
}

export function IsEqualOrLessThan(
    property: string,
    custom?: CustomCheckDateFromTo,
    validationOptions?: ValidationOptions
) {
    return function (object: any, propertyName: string) {
        let message = '$property must be equal to or less than the opposite side';
        validationOptions = validationOptions || ({ message } as any);

        registerDecorator({
            name: 'IsEqualOrLessThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [
                {
                    ...custom,
                    property
                }
            ],
            options: validationOptions,
            validator: IsEqualOrLessThanValidator
        });
    };
}
