import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { SelfAssessmentQuestionResponseEntity } from '../entities/self-assessment-question-response.entity';

@CustomRepository(SelfAssessmentQuestionResponseEntity)
export class SelfAssessmentQuestionResponseRepository extends BaseRepository<SelfAssessmentQuestionResponseEntity> {}
