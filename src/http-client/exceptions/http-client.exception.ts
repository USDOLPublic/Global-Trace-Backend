import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

export class HttpClientException extends HttpException {
    constructor(error: AxiosError<any>) {
        super(error.response?.data?.error?.message, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
