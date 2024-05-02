import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { env } from '~config/env.config';
import { Cache } from 'cache-manager';
import md5 from 'md5';
import { CacheOptions } from '~core/types/cache-options.type';
import { DEFAULT_CACHING_TTL } from '~core/constants/microservice.constant';

export class MicroserviceHelper<Model> {
    private topicName: string;
    private payload: any;
    private cacheManager: Cache;
    private cacheOptions?: CacheOptions;

    static with<Model>(client: ClientKafka, model?: { new (): Model }) {
        return new MicroserviceHelper<Model>(client, model);
    }

    private constructor(private client: ClientKafka, private model: { new (): Model }) {}

    topic(name: string): MicroserviceHelper<Model> {
        this.topicName = `${env.KAFKA_PREFIX}${name}`;
        return this;
    }

    data(data: any): MicroserviceHelper<Model> {
        this.payload = { value: data };
        return this;
    }

    withCache(cacheManger: Cache, options?: CacheOptions): MicroserviceHelper<Model> {
        this.cacheManager = cacheManger;
        this.cacheOptions = options;
        return this;
    }

    async getOne(): Promise<Model> {
        let data = await this.getMany();
        return data[0];
    }

    async getMany(): Promise<Model[]> {
        let data = await this.execute();
        if (Array.isArray(data)) {
            return plainToClass(this.model, data);
        } else {
            return [plainToClass(this.model, data)];
        }
    }

    private async execute<T>(): Promise<T> {
        let handler = () => this.toPromise<T>(this.client.send(this.topicName, this.payload || {}));

        if (this.cacheManager) {
            const { ttl = DEFAULT_CACHING_TTL, prefix } = this.cacheOptions || {};
            const key = prefix + md5(this.topicName + JSON.stringify(this.payload || {}));
            const cachedData = await this.cacheManager.get<T>(key);

            if (!cachedData) {
                const data = await handler();
                await this.cacheManager.set(key, data, ttl);
                return data;
            }

            return cachedData;
        }

        return handler();
    }

    private async toPromise<T>(observe: Observable<T>) {
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
