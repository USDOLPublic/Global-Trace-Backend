import { FileUploadType } from '~core/types/file-upload.type';
import { VerifiedRatioType } from './verified-ratio.type';

export type ManualAddedProductType = {
    productDefinitionId: string;
    code: string;
    quantity: number;
    quantityUnit: string;
    additionalAttributes: { attributeId: string; value: any }[];
    certifications: FileUploadType[];
    dnaIdentifier?: string | null;
    verifiedRatio?: VerifiedRatioType;
};
