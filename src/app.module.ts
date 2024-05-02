import { CommandModule } from '@diginexhk/nestjs-command';
import { ResponseInterceptor } from '@diginexhk/nestjs-response';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from '~app.controller';
import { BusinessPartnerModule } from '~business-partners/business-partner.module';
import { CategoryModule } from '~categories/category.module';
import { GlobalCacheModule } from '~config/cache.config';
import { databaseConfig } from '~config/database.config';
import { i18nConfig } from '~config/i18n.config';
import { loggerConfig } from '~config/logger.config';
import { queueConfig } from '~config/queue.config';
import { scheduleConfig } from '~config/schedule.config';
import { seedConfig } from '~config/seed.config';
import { storageConfig } from '~config/storage.config';
import { throttlerConfig } from '~config/throttler.config';
import { transactionConfig } from '~config/transaction.config';
import { HttpExceptionFilter } from '~core/filters/http-exception.filter';
import { DnaTestingModule } from '~dna-testing/dna-testing.module';
import { DynamicLinkModule } from '~dynamic-link/dynamic-link.module';
import { ExportTemplateModule } from '~export-templates/export-template.module';
import { FacilityModule } from '~facilities/facility.module';
import { FileModule } from '~files/file.module';
import { GrievanceReportModule } from '~grievance-report/grievance-report.module';
import { HistoryModule } from '~history/history.module';
import { LocationModule } from '~locations/location.module';
import { mailConfig } from '~mails/mail.config';
import { EventModule } from '~events/event.module';
import { OrderModule } from '~order/order.module';
import { PdfExportModule } from '~pdf-exports/pdf-export.module';
import { ProductDefinitionModule } from '~product-definitions/product-definition.module';
import { ProductModule } from '~products/product.module';
import { QrCodeModule } from '~qr-codes/qr-code.module';
import { RiskAssessmentModule } from '~risk-assessments/risk-assessment.module';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SelfAssessmentModule } from '~self-assessments/self-assessment.module';
import { SiteDetailModule } from '~site-details/site-details.module';
import { SupplyChainModule } from '~supply-chains/supply-chain.module';
import { TaxonomyExploitationModule } from '~taxonomy-exploitations/taxonomy-exploitation.module';
import { TranslateModule } from '~translate/translate.module';
import { UploadModule } from '~uploads/upload.module';
import { UserModule } from '~users/user.module';

@Module({
    imports: [
        databaseConfig,
        i18nConfig,
        mailConfig,
        throttlerConfig,
        queueConfig,
        scheduleConfig,
        transactionConfig,
        seedConfig,
        storageConfig,
        loggerConfig,
        GlobalCacheModule,
        CommandModule,
        UserModule,
        RolePermissionModule,
        FacilityModule,
        QrCodeModule,
        DynamicLinkModule,
        LocationModule,
        GrievanceReportModule,
        OrderModule,
        HistoryModule,
        ExportTemplateModule,
        FileModule,
        PdfExportModule,
        SelfAssessmentModule,
        DnaTestingModule,
        UploadModule,
        CategoryModule,
        TranslateModule,
        ProductDefinitionModule,
        ProductModule,
        SiteDetailModule,
        TranslateModule,
        TaxonomyExploitationModule,
        SupplyChainModule,
        RiskAssessmentModule,
        BusinessPartnerModule,
        EventModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor
        }
    ]
})
export class AppModule {}
