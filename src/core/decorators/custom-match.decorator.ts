import { registerDecorator, ValidationOptions } from 'class-validator';

export const CustomMatch = (property: string, pattern: RegExp, validationOptions?: ValidationOptions) => {
    return function (object, propertyName: string) {
        registerDecorator({
            name: 'CustomMatch',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return pattern.test(value);
                }
            }
        });
    };
};
