import { ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';

export function IsStringOrNull(validationOptions?: ValidationOptions) {
    return function (object, propertyName: string) {
        registerDecorator({
            name: 'IsStringOrNull',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const each = validationOptions?.each || false;

                    if (Array.isArray(value) && each) {
                        return value.every((v) => typeof v === 'string' || v === null);
                    }

                    return typeof value === 'string' || value === null;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a string or null`;
                }
            }
        });
    };
}
