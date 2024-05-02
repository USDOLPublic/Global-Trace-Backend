import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsAlphaAndSpace(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        const message = '$property must contain only letters and spaces';
        validationOptions = validationOptions || ({ message } as any);

        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: string, args: ValidationArguments) {
                    return new RegExp(/^[A-Za-z\s]*$/).test(value);
                }
            }
        });
    };
}
