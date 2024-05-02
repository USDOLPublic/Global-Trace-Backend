import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { OrderEntity } from '~order/entities/order.entity';

@CustomRepository(OrderEntity)
export class OrderRepository extends BaseRepository<OrderEntity> {}
