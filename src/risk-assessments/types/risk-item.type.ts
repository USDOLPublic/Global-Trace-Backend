import { CategoryEntity } from '~categories/entities/category.entity';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';
import { RiskSourceEnum } from '~risk-assessments/enums/risk-source.enum';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';

export type RiskItemType = {
    facilityId?: string;
    indicator: CategoryEntity;
    subIndicator: CategoryEntity;
    severity: SeverityEnum;
    source: RiskSourceEnum;
    createdAt: number;
    role?: RoleEntity;
    additionData?: {
        good?: string;
        reportMessage?: string;
        saqAnswer?: {
            question: SelfAssessmentQuestionEntity;
            response: SelfAssessmentQuestionResponseEntity;
            value?: string;
        };
    };
};
