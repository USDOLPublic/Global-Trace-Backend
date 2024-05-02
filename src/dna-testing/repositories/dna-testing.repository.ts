import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { DnaTestingEntity } from '~dna-testing/entities/dna-testing.entity';

@CustomRepository(DnaTestingEntity)
export class DnaTestingRepository extends BaseRepository<DnaTestingEntity> {}
