import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { forwardRef, Module } from '@nestjs/common';
import { CategoryModule } from '~categories/category.module';
import { FacilityModule } from '~facilities/facility.module';
import { LocationModule } from '~locations/location.module';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { GeographicalRiskLevelEntity } from '~self-assessments/entities/geographical-risk-level.entity';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { SelfAssessmentUploadFileEntity } from '~self-assessments/entities/self-assessment-upload-file.entity';
import { SelfAssessmentController } from '~self-assessments/http/controllers/self-assessment.controller';
import { GeographicalRiskLevelRepository } from '~self-assessments/repositories/geographical-risk-level.repository';
import { SelfAssessmentGroupRepository } from '~self-assessments/repositories/self-assessment-group.repository';
import { SelfAssessmentQuestionResponseRepository } from '~self-assessments/repositories/self-assessment-question-response.repository';
import { SelfAssessmentUploadFileRepository } from '~self-assessments/repositories/self-assessment-upload-file.repository';
import { SelfAssessmentRepository } from '~self-assessments/repositories/self-assessment.repository';
import { GeographicalRiskLevelService } from '~self-assessments/services/geographical-risk-level.service';
import { ValidateUploadFacilityGroupTemplateService } from '~self-assessments/services/import/facility-group-template/validate-upload-facility-group-template.service';
import { GetDataExcelService } from '~self-assessments/services/import/get-data-excel.service';
import { ImportSelfAssessmentService } from '~self-assessments/services/import/import-self-assessment.service';
import { ImportGroupQuestionService } from '~self-assessments/services/import/saq/import-group-question.service';
import { ImportSaqExcelService } from '~self-assessments/services/import/saq/import-saq-excel.service';
import { ValidateImportSaqService } from '~self-assessments/services/import/saq/validate-import-saq.service';
import { ValidateSelfAssessmentService } from '~self-assessments/services/import/validate-self-assessment.service';
import { SelfAssessmentQuestionResponseService } from '~self-assessments/services/self-assessment-question-response.service';
import { SelfAssessmentQuestionService } from '~self-assessments/services/self-assessment-question.service';
import { SelfAssessmentUploadFileService } from '~self-assessments/services/self-assessment-upload-file.service';
import { SelfAssessmentService } from '~self-assessments/services/self-assessment.service';
import { UserModule } from '~users/user.module';
import { SelfAssessmentGroupEntity } from './entities/self-assessment-group.entity';
import { SelfAssessmentQuestionResponseEntity } from './entities/self-assessment-question-response.entity';
import { SelfAssessmentQuestionEntity } from './entities/self-assessment-question.entity';
import { SelfAssessmentTranslationFileEntity } from './entities/self-assessment-translation-file.entity';
import { SelfAssessmentEntity } from './entities/self-assessment.entity';
import { SelfAssessmentAnswerRepository } from './repositories/self-assessment-answer.repository';
import { SelfAssessmentQuestionRepository } from './repositories/self-assessment-question.repository';
import { SelfAssessmentTranslationFileRepository } from './repositories/self-assessment-translation-file.repository';
import { SelfAssessmentAnswerService } from './services/self-assessment-answer.service';
import { SelfAssessmentGroupService } from './services/self-assessment-group.service';
import { SelfAssessmentQuestionRiskService } from './services/self-assessment-question-risk.service';
import { SelfAssessmentTranslationFileService } from './services/self-assessment-translation-file.service';

@Module({
    controllers: [SelfAssessmentController],
    exports: [
        SelfAssessmentService,
        SelfAssessmentGroupService,
        SelfAssessmentAnswerService,
        SelfAssessmentQuestionService,
        SelfAssessmentUploadFileService,
        GeographicalRiskLevelService,
        SelfAssessmentQuestionRiskService
    ],
    providers: [
        SelfAssessmentService,
        SelfAssessmentAnswerService,
        SelfAssessmentGroupService,
        SelfAssessmentQuestionService,
        ImportSaqExcelService,
        SelfAssessmentQuestionResponseService,
        SelfAssessmentUploadFileService,
        GeographicalRiskLevelService,
        GetDataExcelService,
        ImportGroupQuestionService,
        ImportSelfAssessmentService,
        ValidateSelfAssessmentService,
        ValidateImportSaqService,
        ValidateUploadFacilityGroupTemplateService,
        SelfAssessmentTranslationFileService,
        SelfAssessmentQuestionRiskService
    ],
    imports: [
        TypeOrmHelperModule.forCustomRepository([
            SelfAssessmentEntity,
            SelfAssessmentRepository,
            SelfAssessmentGroupEntity,
            GeographicalRiskLevelEntity,
            SelfAssessmentGroupRepository,
            SelfAssessmentQuestionEntity,
            SelfAssessmentUploadFileEntity,
            SelfAssessmentQuestionRepository,
            SelfAssessmentAnswerEntity,
            SelfAssessmentAnswerRepository,
            SelfAssessmentQuestionResponseEntity,
            SelfAssessmentQuestionResponseRepository,
            SelfAssessmentUploadFileRepository,
            GeographicalRiskLevelRepository,
            SelfAssessmentTranslationFileEntity,
            SelfAssessmentTranslationFileRepository
        ]),
        forwardRef(() => UserModule),
        forwardRef(() => FacilityModule),
        RolePermissionModule,
        LocationModule,
        CategoryModule
    ]
})
export class SelfAssessmentModule {}
