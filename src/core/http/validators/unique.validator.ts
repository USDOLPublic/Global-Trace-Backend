import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';
import { BaseEntity } from '~core/entities/base.entity';
import { CustomCondition } from '~core/interfaces/custom-condition.interface';
import { ExistsValidator } from './exists.validator';

@ValidatorConstraint({ async: true })
export class UniqueValidator implements ValidatorConstraintInterface {
    async validate(value: any, args: ValidationArguments) {
        return !(await new ExistsValidator().validate(value, args));
    }
}

/**
 * Check value is unique in table
 */
export function Unique(
    table: { new (): BaseEntity },
    column: string,
    caseInsensitive: boolean = false,
    customs?: CustomCondition[],
    validationOptions?: ValidationOptions
) {
    let message = { message: 'The $property has already been taken.' };
    if (validationOptions && validationOptions.each) {
        message.message = 'each value in $property has already been taken.';
    }
    validationOptions = { ...message, ...validationOptions };
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [
                {
                    table,
                    column,
                    caseInsensitive,
                    customs
                }
            ],
            validator: UniqueValidator
        });
    };
}
