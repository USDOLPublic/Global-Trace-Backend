import faker from 'faker';
import { OrderEntity } from '~order/entities/order.entity';
import { TestHelper } from '~core/tests/test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { OrderRepository } from '~order/repositories/order.repository';
import moment from 'moment';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class OrderTestHelper {
    constructor(private testHelper: TestHelper) {}

    async createOrder(
        creator: UserEntity,
        brandFacility: FacilityEntity,
        ginnerFacility: FacilityEntity,
        options: Partial<OrderEntity> = {}
    ) {
        return OrderRepository.make().createOne({
            purchaseOrderNumber: faker.random.words(20),
            purchasedAt: moment().unix(),
            productDescription: faker.random.words(20),
            quantity: faker.random.words(20),
            invoiceNumber: faker.random.words(9),
            packingListNumber: faker.random.words(9),
            creatorId: creator.id,
            facilityId: brandFacility.id,
            supplierId: ginnerFacility.id,
            ...options
        });
    }
}
