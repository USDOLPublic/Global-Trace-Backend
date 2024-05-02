import { firstValueFrom, Observable } from 'rxjs';
import { HttpException } from '@nestjs/common';

export abstract class BaseMicroservice {
    protected async toPromise<T>(observe: Observable<T>) {
        try {
            return await firstValueFrom(observe);
        } catch (error) {
            if (error.code) {
                let httpError = new HttpException(error.description, error.code);
                httpError['response' as any] = error.errors;
                httpError.message = error.message;
                throw httpError;
            } else {
                throw error;
            }
        }
    }
}
