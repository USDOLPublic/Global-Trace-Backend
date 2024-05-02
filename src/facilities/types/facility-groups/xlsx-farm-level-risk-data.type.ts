import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { MappingSelfAssessmentType } from '~facilities/types/mapping-self-assessment.type';

export type FarmLevelRiskExcelData = {
    id: string;
    farmName: string;
    tehsil: string;
    latitude: string;
    longitude: string;
    businessRegisterNumber: string;
    firstNameContactor: string;
    lastNameContactor: string;
    contactPhoneNumber: string;
    certification: string | FarmCertificationEnum;
    certificationExpiredDate: Date;
    selfAssessments?: MappingSelfAssessmentType;
    createdAt?: number;
    farmUUID?: string;
    rowIndex?: number;
    isBlankRow: boolean;
};
