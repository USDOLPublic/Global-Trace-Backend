import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { Module } from '@nestjs/common';
import { CategoryModule } from '~categories/category.module';
import { DnaTestingModule } from '~dna-testing/dna-testing.module';
import { GrievanceReportModule } from '~grievance-report/grievance-report.module';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SelfAssessmentModule } from '~self-assessments/self-assessment.module';
import { RiskAssessmentEntity } from './entities/risk-assessment.entity';
import { RiskAssessmentController } from './http/controllers/risk-assessment.controller';
import { RiskAssessmentRepository } from './repositories/risk-assessment.repository';
import { FacilityRiskService } from './services/facility-risk.service';
import { RiskAssessmentService } from './services/risk-assessment.service';

@Module({
    providers: [RiskAssessmentService, FacilityRiskService],
    controllers: [RiskAssessmentController],
    imports: [
        TypeOrmHelperModule.forCustomRepository([RiskAssessmentRepository, RiskAssessmentEntity]),
        RolePermissionModule,
        SelfAssessmentModule,
        GrievanceReportModule,
        DnaTestingModule,
        CategoryModule
    ],
    exports: [FacilityRiskService]
})
export class RiskAssessmentModule {}
