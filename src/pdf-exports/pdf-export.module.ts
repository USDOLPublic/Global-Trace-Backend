import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FacilityModule } from '~facilities/facility.module';
import { GrievanceReportModule } from '~grievance-report/grievance-report.module';
import { EventModule } from '~events/event.module';
import { OrderModule } from '~order/order.module';
import { ProductModule } from '~products/product.module';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SelfAssessmentModule } from '~self-assessments/self-assessment.module';
import { SupplyChainModule } from '~supply-chains/supply-chain.module';
import { PdfExportFacilityDetailController } from './http/controllers/facility-detail.controller';
import { PdfExportController } from './http/controllers/pdf-export.controller';
import { PdfExportTracingObjectService } from './services/pdf-export-tracing-object.service';
import { PdfExportService } from './services/pdf-export.service';
import { RiskAssessmentModule } from '~risk-assessments/risk-assessment.module';

@Module({
    providers: [PdfExportService, PdfExportTracingObjectService],
    controllers: [PdfExportController, PdfExportFacilityDetailController],
    exports: [PdfExportService, PdfExportTracingObjectService],
    imports: [
        HttpModule,
        OrderModule,
        GrievanceReportModule,
        FacilityModule,
        SelfAssessmentModule,
        RolePermissionModule,
        ProductModule,
        EventModule,
        SupplyChainModule,
        RiskAssessmentModule
    ]
})
export class PdfExportModule {}
