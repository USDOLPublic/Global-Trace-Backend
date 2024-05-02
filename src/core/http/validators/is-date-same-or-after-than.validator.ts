import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import moment from 'moment';

export function IsDateEqualOrAfterThan(property: string, validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        let message = '$property must be same to or after the opposite side';
        validationOptions = validationOptions || ({ message } as any);

        registerDecorator({
            name: 'IsDateEqualOrAfter',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: number, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    return moment.unix(value).isSameOrAfter(moment.unix(relatedValue));
                }
            }
        });
    };
}
