import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SwaggerEnumType } from '@nestjs/swagger/dist/types/swagger-enum.type';
import { ApiParam } from '@nestjs/swagger';
import { ValidateFieldException } from '@diginexhk/nestjs-exception';

type EnumParamOptions = {
    enum: SwaggerEnumType;
    key: string;
    nullable?: boolean;
};

const enumsDecorator = createParamDecorator((options: EnumParamOptions, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.params[options.key];

    if (!value && options.nullable) {
        return value;
    }

    const hasMismatched = !Object.keys(options.enum).includes(value);
    if (hasMismatched) {
        throw new ValidateFieldException(options.key, 'invalid_enum_value', 'invalidEnum');
    }

    return value;
});

export function EnumParam(options: EnumParamOptions) {
    return (target: any, key: string, descriptor: any) => {
        ApiParam({
            description: `Available enums: ${Object.keys(options.enum)}`,
            example: Object.keys(options.enum)[0],
            name: options.key,
            required: !options.nullable
        })(target, key, Object.getOwnPropertyDescriptor(target, key));
        return enumsDecorator(options)(target, key, descriptor);
    };
}
