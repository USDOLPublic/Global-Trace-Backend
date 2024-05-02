import { HttpException, HttpStatus } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { ErrorResultType } from '~core/validators/types/error-result.type';

export class BadDataRequestException extends HttpException {
    constructor(error: ErrorResultType, type?: string, payload?: any) {
        super({}, HttpStatus.BAD_REQUEST);
        this['response' as any] = this.toResponse(error, type, payload);
    }

    private toResponse(error: ErrorResultType, type: string, payload?: any) {
        const responseData: { error: ErrorResultType; type: string; payload?: any } = {
            error,
            type: type || 'BAD_REQUEST_DATA'
        };
        if (!isEmpty(payload)) {
            responseData.payload = payload;
        }
        return responseData;
    }
}
