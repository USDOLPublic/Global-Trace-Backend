import { CategoryEntity } from '~categories/entities/category.entity';
import { RiskType } from './risk.type';
import { SubIndicatorRiskType } from './sub-indicator-risk.type';

export type IndicatorRiskType = {
    indicator: CategoryEntity;
    risk: RiskType;
    subIndicatorRiskData: SubIndicatorRiskType[];
};
