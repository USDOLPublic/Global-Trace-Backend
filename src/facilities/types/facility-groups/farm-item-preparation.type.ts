import { FarmLevelRiskExcelData } from '~facilities/types/facility-groups/xlsx-farm-level-risk-data.type';

export type FarmItemPreparationType = {
    farmGroupId: string;
    data: FarmLevelRiskExcelData;
};
