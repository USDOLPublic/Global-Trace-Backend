import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';
import { isTimestamp } from '~core/helpers/time.helper';

@ValidatorConstraint({ async: true })
export class IsTimestampValidator implements ValidatorConstraintInterface {
    validate(propertyValue: number, args: ValidationArguments) {
        return isTimestamp(propertyValue);
    }
}

export function IsTimestamp(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        let message = '$property must be a valid timestamp';
        validationOptions = validationOptions || ({ message } as any);

        registerDecorator({
            name: 'isTimestamp',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: IsTimestampValidator
        });
    };
}
