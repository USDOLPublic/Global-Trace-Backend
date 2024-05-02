import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';

@ValidatorConstraint({ async: true })
class PasswordValidator implements ValidatorConstraintInterface {
    async validate(value: string) {
        let regex = new RegExp('(?=(.*[0-9]))(?=.*[!@#$%^&*])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,255}');
        return regex.test(value);
    }
}

export function Password(customs?: any[], validationOptions?: ValidationOptions) {
    validationOptions = validationOptions || ({ message: 'The $property is invalid.' } as any);
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: PasswordValidator
        });
    };
}
