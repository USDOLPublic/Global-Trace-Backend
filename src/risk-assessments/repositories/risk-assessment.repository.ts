import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { RiskAssessmentEntity } from '~risk-assessments/entities/risk-assessment.entity';

@CustomRepository(RiskAssessmentEntity)
export class RiskAssessmentRepository extends BaseRepository<RiskAssessmentEntity> {}
