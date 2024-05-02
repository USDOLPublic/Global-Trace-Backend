import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { TransactionItemEntity } from '~events/entities/transaction-item.entity';

@CustomRepository(TransactionItemEntity)
export class TransactionItemRepository extends BaseRepository<TransactionItemEntity> {}
