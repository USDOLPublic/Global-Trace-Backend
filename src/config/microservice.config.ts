import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { env } from '~config/env.config';
import { randomUUID } from 'crypto';

export const microserviceConfig: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
        client: {
            clientId: 'ESG_BACKEND' + randomUUID(),
            brokers: [env.KAFKA_URL]
        },
        consumer: {
            groupId: 'ESG_BACKEND' + randomUUID()
        }
    }
};
