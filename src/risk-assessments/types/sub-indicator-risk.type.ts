import { CategoryEntity } from '~categories/entities/category.entity';
import { RiskType } from './risk.type';
import { ResultRiskItemType } from './result-risk-item.type';

export type SubIndicatorRiskType = {
    subIndicator: CategoryEntity;
    risk: RiskType;
    data: ResultRiskItemType[];
};
