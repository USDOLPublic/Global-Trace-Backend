import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { TransformationItemEntity } from '../entities/transformation-item.entity';

@CustomRepository(TransformationItemEntity)
export class TransformationItemRepository extends BaseRepository<TransformationItemEntity> {}
