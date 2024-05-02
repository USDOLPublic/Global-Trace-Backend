import { Module, forwardRef } from '@nestjs/common';
import { GrievanceReportService } from '~grievance-report/services/grievance-report.service';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import { GrievanceReportController } from './http/controllers/grievance-report.controller';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { UserModule } from '~users/user.module';
import { UserRepository } from '~users/repositories/user.repository';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { RequestController } from '~grievance-report/http/controllers/request.controller';
import { GrievanceReportResponseEntity } from '~grievance-report/entities/grievance-report-response.entity';
import { GrievanceReportResponseRepository } from '~grievance-report/repositories/grievance-report-response.repository';
import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { LaborRiskEntity } from './entities/labor-risk.entity';
import { LaborRiskRepository } from './repositories/labor-risk.repository';
import { LaborRiskService } from './services/labor-risk.service';
import { UpdateGrievanceReportsCommand } from './commands/update-grievance-reports.command';
import { CategoryModule } from '~categories/category.module';
import { ComplianceHistoryService } from './services/compliance-history.service';
import { ViewGrievanceReportGuard } from './http/guards/view-grievance-report.guard';
import { RequestService } from './services/request.service';
import { GrievanceReportRiskService } from './services/grievance-report-risk.service';
import { FacilityModule } from '~facilities/facility.module';

@Module({
    providers: [
        GrievanceReportService,
        RequestService,
        LaborRiskService,
        ComplianceHistoryService,
        GrievanceReportRiskService,
        UpdateGrievanceReportsCommand,
        ViewGrievanceReportGuard
    ],
    controllers: [GrievanceReportController, RequestController],
    exports: [GrievanceReportService, ComplianceHistoryService, GrievanceReportRiskService],
    imports: [
        RolePermissionModule,
        forwardRef(() => UserModule),
        CategoryModule,
        TypeOrmHelperModule.forCustomRepository([
            GrievanceReportRepository,
            GrievanceReportEntity,
            UserRepository,
            FacilityRepository,
            GrievanceReportResponseEntity,
            GrievanceReportResponseRepository,
            LaborRiskEntity,
            LaborRiskRepository
        ]),
        forwardRef(() => FacilityModule)
    ]
})
export class GrievanceReportModule {}
