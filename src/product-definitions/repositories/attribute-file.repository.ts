import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { AttributeFileEntity } from '~product-definitions/entities/attribute-file.entity';

@CustomRepository(AttributeFileEntity)
export class AttributeFileRepository extends BaseRepository<AttributeFileEntity> {}
