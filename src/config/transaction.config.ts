import { TransactionModule } from '@diginexhk/nestjs-transaction';
import { MailService } from '@diginexhk/nestjs-mailer';
import { I18nService } from 'nestjs-i18n';
import { StorageService } from '@diginexhk/nestjs-storage';
import { Connection } from 'typeorm';
import { OpenApparelRegistryService } from '~http-client/open-apparel-registry/services/open-apparel-registry.service';
import { DynamicLinkService } from '~dynamic-link/services/dynamic-link.service';
import { FACILITY_RISK_CALCULATION } from '~facilities/constants/queue.constant';
import { getQueueToken } from '@nestjs/bull';

export const transactionConfig = TransactionModule.forRoot([
    MailService,
    I18nService,
    StorageService,
    Connection,
    OpenApparelRegistryService,
    DynamicLinkService,
    getQueueToken(FACILITY_RISK_CALCULATION)
]);
