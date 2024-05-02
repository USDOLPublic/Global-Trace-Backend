import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';
import moment from 'moment';
import { CustomCheckDateFromTo } from '~core/interfaces/custom-check-date-from-to';
import { ColumnTypes } from '~core/types/column-type.type';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { getDataSource } from '@diginexhk/typeorm-helper';

@ValidatorConstraint({ async: true })
export class IsEqualOrLongerThanValidator implements ValidatorConstraintInterface {
    static async getDateValue(constraint: any, body: any) {
        const { property, table, column } = constraint;
        const dateValue = body[property];
        if (!dateValue && table) {
            const value: ColumnTypes = isFunction(constraint.value) ? constraint.value(body) : constraint.value;
            const query = getDataSource()
                .createQueryBuilder()
                .from(table, table)
                .select(`"${property}"`)
                .where({ [column]: value });

            const data = await query.limit(1).getRawOne();
            if (!data) {
                return false;
            }
            return data[property] / 1000;
        }
        return dateValue;
    }

    async validate(propertyValue: number, args: ValidationArguments) {
        const fromDate = await IsEqualOrLongerThanValidator.getDateValue(args.constraints[0], args.object);
        return moment(propertyValue).isSameOrAfter(fromDate);
    }
}

export function IsEqualOrLongerThan(
    property: string,
    custom: CustomCheckDateFromTo,
    validationOptions?: ValidationOptions
) {
    return function (object: any, propertyName: string) {
        let message = '$property must be equal to or longer than the opposite side';
        validationOptions = validationOptions || ({ message } as any);

        registerDecorator({
            name: 'IsEqualOrLongerThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [
                {
                    ...custom,
                    property
                }
            ],
            options: validationOptions,
            validator: IsEqualOrLongerThanValidator
        });
    };
}
