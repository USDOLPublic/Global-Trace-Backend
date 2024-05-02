import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class NumericValidator implements ValidatorConstraintInterface {
    private isExponentialNotation(value: string): boolean {
        return value.indexOf('1e+') > -1;
    }

    private getLengthOfExponentialNotationNumber(value: string): number {
        const [, length] = value.split('+');
        return +length;
    }

    validate(propertyValue: number, args: ValidationArguments) {
        const [precision, scale] = args.constraints;
        const [precisionPart, decimalPart] = String(propertyValue).split('.');

        let isValidPrecision: boolean = precision >= precisionPart.length;
        if (this.isExponentialNotation(precisionPart)) {
            isValidPrecision = precision >= this.getLengthOfExponentialNotationNumber(precisionPart);
        }

        if (decimalPart) {
            isValidPrecision = precision - decimalPart.length >= precisionPart.length;
            const isValidDecimal = scale >= decimalPart.length;
            return isValidPrecision && isValidDecimal;
        }

        return isValidPrecision;
    }
}

export function Numeric(precision: number, scale: number = 0, validationOptions?: ValidationOptions) {
    validationOptions =
        validationOptions || ({ message: '$property is not valid numeric ($constraint1:$constraint2).' } as any);
    return function (object: any, propertyName) {
        registerDecorator({
            name: 'Numeric',
            target: object.constructor,
            propertyName,
            constraints: [precision, scale],
            options: validationOptions,
            validator: NumericValidator
        });
    };
}
