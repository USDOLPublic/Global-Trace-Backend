import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { SelfAssessmentUploadFileEntity } from '../entities/self-assessment-upload-file.entity';

@CustomRepository(SelfAssessmentUploadFileEntity)
export class SelfAssessmentUploadFileRepository extends BaseRepository<SelfAssessmentUploadFileEntity> {}
