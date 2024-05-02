import { BaseRepository, CustomRepository } from '@diginexhk/typeorm-helper';
import { SelfAssessmentTranslationFileEntity } from '~self-assessments/entities/self-assessment-translation-file.entity';

@CustomRepository(SelfAssessmentTranslationFileEntity)
export class SelfAssessmentTranslationFileRepository extends BaseRepository<SelfAssessmentTranslationFileEntity> {}
