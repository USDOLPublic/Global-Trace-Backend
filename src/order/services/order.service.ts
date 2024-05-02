import { PaginationParams, SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { pick } from 'lodash';
import { OrderFacilityService } from '~facilities/services/order-facility.service';
import { CreateOrderDto } from '~order/http/dto/create-order-dto';
import { EditOrderDto } from '~order/http/dto/edit-order-dto';
import { GetListOrderQuery } from '~order/queries/get-list-order.query';
import { OrderRepository } from '~order/repositories/order.repository';
import { AddOrderSupplierType } from '~order/types/add-order-supplier.type';
import { UserEntity } from '~users/entities/user.entity';
import { OrderSupplierService } from './order-supplier.service';

@Injectable()
export class OrderService extends TransactionService {
    constructor(
        private orderRepo: OrderRepository,
        @Inject(forwardRef(() => OrderSupplierService))
        private orderSupplierService: OrderSupplierService,
        private orderFacilityService: OrderFacilityService
    ) {
        super();
    }

    async createOrder(user: UserEntity, data: CreateOrderDto) {
        const supplier = await this.orderFacilityService.findSupplierForOrder(user, data.supplierId);
        await this.orderSupplierService.checkValidFirstOrderSupplier(supplier);

        const order = await this.orderRepo.createOne({
            creatorId: user.id,
            facilityId: user.currentFacility.id,
            ...data
        });

        const orderSupplierData: AddOrderSupplierType = pick(data, [
            'supplierId',
            'purchaseOrderNumber',
            'purchasedAt',
            'invoiceNumber',
            'packingListNumber'
        ]);
        await this.orderSupplierService.addOrderSupplier({
            user,
            orderId: order.id,
            data: orderSupplierData
        });

        return order;
    }

    async editOrderById(user: UserEntity, id: string, data: EditOrderDto) {
        const order = await this.getOrderById(user, id);

        if (data.supplierId && order.supplierId !== data.supplierId) {
            const supplier = await this.orderFacilityService.findSupplierForOrder(user, data.supplierId);
            await this.orderSupplierService.checkValidFirstOrderSupplier(supplier);
            await this.orderSupplierService.changeFirstSupplier(user, order, supplier);
        }

        const orderSupplierData = pick(data, [
            'purchaseOrderNumber',
            'purchasedAt',
            'invoiceNumber',
            'packingListNumber'
        ]);
        await this.orderSupplierService.updateFirstSupplierTraceInfo(order, orderSupplierData);

        return this.orderRepo.updateOrFail({ id }, data);
    }

    getListOrder(user: UserEntity, paginationParams: PaginationParams, sortParams: SortMultipleParams[]) {
        return this.orderRepo.pagination(new GetListOrderQuery(user.currentFacility.id, sortParams), paginationParams);
    }

    async deleteOrder(user: UserEntity, id: string) {
        await this.getOrderById(user, id);
        return this.orderRepo.deleteOrFail({ id });
    }

    getOrderById(user: UserEntity, id: string) {
        return this.orderRepo.findOneOrFail({
            where: { id, facilityId: user.currentFacility.id },
            relations: ['supplier']
        });
    }
}
