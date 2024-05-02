import { StorageModule } from '@diginexhk/nestjs-storage';
import { env } from './env.config';

export const storageConfig = StorageModule.forRoot({
    account: {
        name: env.S3.ACCOUNT_NAME,
        key: env.S3.ACCOUNT_KEY,
        containerName: env.S3.BLOB_CONTAINER,
        expiredIn: env.S3.SAS_EXPIRED_IN
    },
    disk: 's3'
});
