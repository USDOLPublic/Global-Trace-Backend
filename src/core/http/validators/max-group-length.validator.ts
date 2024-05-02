import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Check max length of group of properties
 */
export function MaxGroupLength(properties: string[], maxLength: number, validationOptions?: ValidationOptions) {
    const message = { message: `Total length of $property must be shorter than $constraint1 characters` };

    validationOptions = { ...message, ...validationOptions };
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [maxLength],
            validator: {
                validate(value: any) {
                    if (!Array.isArray(value)) {
                        value = [value];
                    }

                    for (const item of value) {
                        const lengthCount = properties.reduce((acc, cur) => acc + (item[cur] || '').length, 0);

                        if (lengthCount > maxLength) {
                            return false;
                        }
                    }

                    return true;
                }
            }
        });
    };
}
