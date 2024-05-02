import { RiskType } from './risk.type';

export type ResultRiskItemType = {
    createdAt: number;
    source: string;
    risk: RiskType;
    note?: string;
    roleId?: string;
    isIndirect: boolean;
};
