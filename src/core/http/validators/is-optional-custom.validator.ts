import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';

export function IsOptional(): PropertyDecorator {
    return function (object, propertyName: string): void {
        const condition = (objectCondition) =>
            objectCondition[propertyName] !== null && objectCondition[propertyName] !== undefined;

        ValidateIfOrExclude(condition)(object, propertyName);
    };
}
