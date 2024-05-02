import { FacilityRiskType } from '~risk-assessments/types/facility-risk.type';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export type MappingSupplierType = {
    id?: string;
    name?: string;
    type?: RoleEntity;
    orderSupplierId: string;
    isRoot: boolean;
    label: string;
    targets: string[];
    riskData?: FacilityRiskType;
    overallRiskLevel?: RiskScoreLevelEnum;
};
