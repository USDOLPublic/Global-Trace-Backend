import { ValidationPipe } from '~core/http/pipes/validation.pipe';
import { ValidateException } from '@diginexhk/nestjs-exception';

export const validateConfig = new ValidationPipe({
    whitelist: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) => new ValidateException(errors)
});
