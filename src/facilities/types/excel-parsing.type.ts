import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';

export type ExcelParsingType = {
    file: Express.Multer.File | NodeJS.ReadableStream;
    groups?: SelfAssessmentGroupEntity[];
    isParsingForUpdate?: boolean;
    includeEmpty?: boolean;
};
