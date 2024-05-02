import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelfAssessmentTranslationFileRepository } from '~self-assessments/repositories/self-assessment-translation-file.repository';
import { SelfAssessmentTranslationFileEntity } from '~self-assessments/entities/self-assessment-translation-file.entity';
import { FileUploadType } from '~core/types/file-upload.type';

@Injectable()
export class SelfAssessmentTranslationFileService {
    public constructor(
        @InjectRepository(SelfAssessmentTranslationFileRepository)
        private selfAssessmentTranslationFileRepo: SelfAssessmentTranslationFileRepository
    ) {}

    async upsertByRoleId(roleId: string, file: FileUploadType): Promise<SelfAssessmentTranslationFileEntity> {
        const selfAssessmentTranslationFile = await this.selfAssessmentTranslationFileRepo.findOne({
            where: { roleId }
        });

        return this.selfAssessmentTranslationFileRepo.save({ ...selfAssessmentTranslationFile, roleId, file });
    }
}
