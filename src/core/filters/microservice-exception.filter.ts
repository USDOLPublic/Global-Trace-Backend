import { ArgumentsHost, Catch } from '@nestjs/common';
import { HttpExceptionFilter } from '~core/filters/http-exception.filter';

@Catch()
export class MicroserviceExceptionFilter extends HttpExceptionFilter {
    protected isMicroservice: boolean = true;
    catch(exception: any, host: ArgumentsHost) {
        console.log('exception', exception.message);
        return super.catch(exception, host);
    }
}
