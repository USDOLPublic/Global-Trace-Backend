import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';

export type InitWorkbookType = {
    fileOrStream: Express.Multer.File | NodeJS.ReadableStream;
    groups: SelfAssessmentGroupEntity[];
};
