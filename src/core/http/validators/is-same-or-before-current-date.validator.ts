import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import moment from 'moment';

export function IsSameOrBeforeCurrentDate(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        const message = '$property must be same or before now';
        validationOptions = validationOptions || ({ message } as any);

        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: number, args: ValidationArguments) {
                    return value <= moment().unix();
                }
            }
        });
    };
}
