import { CacheModule, Global, Module } from '@nestjs/common';
import { env } from './env.config';
import redisStore from 'cache-manager-redis-store';

export const cacheConfig = CacheModule.register({
    store: redisStore,
    host: env.REDIS.HOST,
    port: env.REDIS.PORT
});

@Global()
@Module({
    exports: [cacheConfig],
    imports: [cacheConfig]
})
export class GlobalCacheModule {}
