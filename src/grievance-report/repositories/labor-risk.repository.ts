import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { LaborRiskEntity } from '~grievance-report/entities/labor-risk.entity';

@CustomRepository(LaborRiskEntity)
export class LaborRiskRepository extends BaseRepository<LaborRiskEntity> {}
