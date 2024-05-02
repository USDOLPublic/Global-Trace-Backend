import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import moment from 'moment';

export function IsSameOrAfterCurrentDate(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        let message = '$property must be greater than the current date';
        validationOptions = validationOptions || ({ message } as any);

        registerDecorator({
            name: 'IsAfterCurrentDate',
            target: object.constructor,
            propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: number, args: ValidationArguments) {
                    return value >= moment().unix();
                }
            }
        });
    };
}
