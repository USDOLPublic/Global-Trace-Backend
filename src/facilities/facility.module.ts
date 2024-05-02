import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { CategoryModule } from '~categories/category.module';
import { EventModule } from '~events/event.module';
import { BrandController } from '~facilities/http/controllers/brand.controller';
import { FacilityPartnerRepository } from '~facilities/repositories/facility-partner.repository';
import { FacilityOperationService } from '~facilities/services/facility-operation.service';
import { FacilityGroupExcelService } from '~facilities/services/import/facility-group-excel.service';
import { ImportFacilityGroupService } from '~facilities/services/import/import-facility-group.service';
import { ValidateFacilityGroupService } from '~facilities/services/import/validate-facility-group.service';
import { FileModule } from '~files/file.module';
import { GrievanceReportModule } from '~grievance-report/grievance-report.module';
import { HttpClientModule } from '~http-client/http-client.module';
import { LocationModule } from '~locations/location.module';
import { RiskAssessmentModule } from '~risk-assessments/risk-assessment.module';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SelfAssessmentModule } from '~self-assessments/self-assessment.module';
import { SiteDetailModule } from '~site-details/site-details.module';
import { SupplyChainModule } from '~supply-chains/supply-chain.module';
import { UserModule } from '~users/user.module';
import { FACILITY_RISK_CALCULATION } from './constants/queue.constant';
import { FacilityPartnerEntity } from './entities/facility-partner.entity';
import { FacilityEntity } from './entities/facility.entity';
import { FacilityGroupController } from './http/controllers/facility-group.controller';
import { FacilityController } from './http/controllers/facility.controller';
import { FacilityRiskCalculationProcessor } from './processors/facility-risk-calculation.processor';
import { FacilityRepository } from './repositories/facility.repository';
import { BrandService } from './services/brand.service';
import { FacilityGroupService } from './services/facility-group.service';
import { FacilityImportDataService } from './services/facility-import-data.service';
import { FacilityPartnerService } from './services/facility-partner.service';
import { FacilityQueueService } from './services/facility-queue.service';
import { FacilityRiskFilerService } from './services/facility-risk-filter.service';
import { FacilityService } from './services/facility.service';
import { ValidateImportTemplateUtilService } from './services/import/validate-import-template-util.service';
import { OrderFacilityService } from './services/order-facility.service';
import { SupplierMappingService } from './services/supplier-mapping.service';
import { FacilitySubscriber } from './subscribers/facility.subscriber';

@Module({
    providers: [
        FacilityService,
        BrandService,
        SupplierMappingService,
        FacilitySubscriber,
        FacilityGroupExcelService,
        FacilityImportDataService,
        FacilityGroupService,
        ValidateFacilityGroupService,
        ImportFacilityGroupService,
        FacilityOperationService,
        ValidateImportTemplateUtilService,
        FacilityPartnerService,
        FacilityRiskFilerService,
        FacilityRiskCalculationProcessor,
        FacilityQueueService,
        OrderFacilityService
    ],
    controllers: [FacilityController, BrandController, FacilityGroupController],
    exports: [
        FacilityService,
        BrandService,
        FacilityImportDataService,
        FacilityPartnerService,
        FacilityQueueService,
        FacilityRiskFilerService,
        OrderFacilityService
    ],
    imports: [
        TypeOrmHelperModule.forCustomRepository([
            FacilityEntity,
            FacilityRepository,
            FacilityPartnerEntity,
            FacilityPartnerRepository,
            RoleRepository
        ]),
        BullModule.registerQueue({
            name: FACILITY_RISK_CALCULATION
        }),
        LocationModule,
        forwardRef(() => EventModule),
        forwardRef(() => HttpClientModule),
        RolePermissionModule,
        forwardRef(() => UserModule),
        forwardRef(() => FileModule),
        forwardRef(() => SelfAssessmentModule),
        forwardRef(() => GrievanceReportModule),
        SupplyChainModule,
        SiteDetailModule,
        RiskAssessmentModule,
        CategoryModule
    ]
})
export class FacilityModule {}
