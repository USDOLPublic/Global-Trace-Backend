import { FileDataValidationType } from '~files/types/file-data-validation.type';
import { RowValidationResultType } from '~files/types/row-validation-result.type';

export type ImportingFarmGroupResultType = RowValidationResultType & {
    fileId: string;
};

export type ImportingFarmLevelRiskResultType = {
    farmLevelRiskTotalItems: number;
    validationFarmLevelRiskErrors: FileDataValidationType[];
    validatedFarmLevelRiskItemCount: number;
};

export type ImportingCommunityRiskResultType = {
    communityRiskTotalItems: number;
    validationCommunityRiskErrors: FileDataValidationType[];
    validatedCommunityRiskItemCount: number;
};
