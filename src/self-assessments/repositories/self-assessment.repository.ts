import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { SelfAssessmentEntity } from '../entities/self-assessment.entity';

@CustomRepository(SelfAssessmentEntity)
export class SelfAssessmentRepository extends BaseRepository<SelfAssessmentEntity> {}
