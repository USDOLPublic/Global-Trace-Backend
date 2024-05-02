import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryBoolean = createParamDecorator((key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.query[key];
    if (value) {
        return value === 'true';
    }
});
