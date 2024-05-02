import { InstructionExcelType } from '~facilities/types/facility-groups/instruction-excel.type';
import { FarmLevelRiskExcelData } from '~facilities/types/facility-groups/xlsx-farm-level-risk-data.type';
import { ValidExcelQuestionData } from './valid-excel-question-data.type';

export type ParseDataFarmGroup = {
    instruction: InstructionExcelType;
    communityRisk: ValidExcelQuestionData;
    farmLevelRisk: FarmLevelRiskExcelData[];
};
