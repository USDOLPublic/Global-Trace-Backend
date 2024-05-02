import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { GeographicalRiskLevelEntity } from '../entities/geographical-risk-level.entity';

@CustomRepository(GeographicalRiskLevelEntity)
export class GeographicalRiskLevelRepository extends BaseRepository<GeographicalRiskLevelEntity> {}
