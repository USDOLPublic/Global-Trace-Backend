import { BaseRepository } from '~core/repositories/base.repository';
import { OrderSupplierEntity } from '../entities/order-supplier.entity';
import { CustomRepository } from '@diginexhk/typeorm-helper';

@CustomRepository(OrderSupplierEntity)
export class OrderSupplierRepository extends BaseRepository<OrderSupplierEntity> {
    getOrderSuppliers(orderId: string) {
        return this.createQueryBuilder('OrderSupplier')
            .withDeleted()
            .where({ orderId })
            .leftJoinAndSelect('OrderSupplier.supplier', 'Facility')
            .leftJoinAndSelect('Facility.users', 'User')
            .leftJoinAndSelect('Facility.type', 'Role')
            .leftJoinAndSelect('Facility.country', 'Country')
            .leftJoinAndSelect('Facility.province', 'Province')
            .leftJoinAndSelect('Facility.district', 'District')
            .getMany();
    }
}
