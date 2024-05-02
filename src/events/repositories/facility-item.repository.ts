import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { FacilityItemEntity } from '~events/entities/facility-item.entity';

@CustomRepository(FacilityItemEntity)
export class FacilityItemRepository extends BaseRepository<FacilityItemEntity> {}
