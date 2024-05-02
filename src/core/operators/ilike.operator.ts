import { FindOperator, FindOperatorType } from 'typeorm';

class FindOperatorWithExtras<T> extends FindOperator<T> {
    constructor(
        type: FindOperatorType | 'ilike',
        value: FindOperator<T> | T,
        useParameter?: boolean,
        multipleParameters?: boolean
    ) {
        super(type, value, useParameter, multipleParameters);
    }
}

/**
 * Find Options Operator.
 * Example: { someField: Like("%some sting%") }
 */
export function ILike<T>(value: T | FindOperator<T>): FindOperatorWithExtras<T> {
    return new FindOperatorWithExtras('ilike', value);
}
