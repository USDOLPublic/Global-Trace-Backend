import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { BusinessDetailEntity } from '../entities/business-detail.entity';

@CustomRepository(BusinessDetailEntity)
export class BusinessDetailRepository extends BaseRepository<BusinessDetailEntity> {}
