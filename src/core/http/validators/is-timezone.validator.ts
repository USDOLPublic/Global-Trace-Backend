import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';
import momentTimezone from 'moment-timezone';

@ValidatorConstraint({ async: true })
export class IsTimezoneValidator implements ValidatorConstraintInterface {
    validate(propertyValue: string, args: ValidationArguments) {
        return Boolean(momentTimezone.tz.zone(propertyValue));
    }
}

export function IsTimezone(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        let message = '$property must be a valid timezone';
        validationOptions = validationOptions || ({ message } as any);

        registerDecorator({
            name: 'isTimezone',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: IsTimezoneValidator
        });
    };
}
