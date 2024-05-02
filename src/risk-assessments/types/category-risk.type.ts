import { CategoryEntity } from '~categories/entities/category.entity';
import { IndicatorRiskType } from './indicator-risk.type';
import { RiskType } from './risk.type';
import { SourceRiskType } from './source-risk.type';

export type CategoryRiskType = {
    category: CategoryEntity;
    risk: RiskType;
    indicatorRiskData: IndicatorRiskType[];
    sourceRiskData: SourceRiskType[];
};
