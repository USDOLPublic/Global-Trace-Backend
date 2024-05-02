import { ArgumentsHost, Catch } from '@nestjs/common';
import { HttpExceptionFilter as BaseHttpExceptionFilter } from '@diginexhk/nestjs-exception';

@Catch()
export class HttpExceptionFilter extends BaseHttpExceptionFilter {
    catchAnotherException(exception: any, host: ArgumentsHost) {
        console.error(exception);
        return super.catchAnotherException(exception, host);
    }
}
