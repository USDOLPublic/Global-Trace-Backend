import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';

@CustomRepository(AttributeEntity)
export class AttributeRepository extends BaseRepository<AttributeEntity> {}
