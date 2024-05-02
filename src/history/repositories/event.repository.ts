import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { EventEntity } from '../entities/event.entity';

@CustomRepository(EventEntity)
export class EventRepository extends BaseRepository<EventEntity> {}
