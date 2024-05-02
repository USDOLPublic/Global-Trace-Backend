import { TransactionService } from '@diginexhk/nestjs-transaction';
import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
    UnprocessableEntityException
} from '@nestjs/common';
import { IsNull } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityPartnerService } from '~facilities/services/facility-partner.service';
import { OrderSupplierEntity } from '~order/entities/order-supplier.entity';
import { OrderEntity } from '~order/entities/order.entity';
import { EditOrderSupplierDto } from '~order/http/dto/edit-order-supplier.dto';
import { OrderSupplierRepository } from '~order/repositories/order-supplier.repository';
import { OrderSupplierDataPreparationType } from '~order/types/order-supplier-data-preparation.type';
import { OrderSupplierTraceInfoType } from '~order/types/order-supplier-trace-info.type';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { OrderService } from './order.service';
import { OrderFacilityService } from '~facilities/services/order-facility.service';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';

@Injectable()
export class OrderSupplierService extends TransactionService {
    constructor(
        @Inject(forwardRef(() => OrderService))
        private orderService: OrderService,
        private orderSupplierRepo: OrderSupplierRepository,
        private supplyChainService: SupplyChainService,
        private facilityPartnerService: FacilityPartnerService,
        private orderFacilityService: OrderFacilityService
    ) {
        super();
    }

    async addOrderSupplier({ user, orderId, data }: OrderSupplierDataPreparationType) {
        await this.orderService.getOrderById(user, orderId);

        const isCreatingOrder: boolean = !!!data?.parentId;

        if (!isCreatingOrder) {
            const parent = await this.orderSupplierRepo.findOneOrFail({
                where: { orderId, id: data.parentId },
                relations: ['supplier']
            });

            const supplier: FacilityEntity = await this.getAndCheckValidSupplier(user, parent, data.supplierId);
            await this.checkValidOrderSupplier(user, supplier, parent.supplier);

            data.fromSupplierId = parent.supplierId;
        }

        return this.orderSupplierRepo.createOne({
            orderId,
            ...data
        });
    }

    async getOrderSupplierById(user: UserEntity, orderId: string, orderSupplierId: string) {
        await this.orderService.getOrderById(user, orderId);
        return this.orderSupplierRepo.findOneByOrFail({ orderId, id: orderSupplierId });
    }

    async editOrderSupplier(user: UserEntity, orderId: string, orderSupplierId: string, data: EditOrderSupplierDto) {
        const currentOrderSupplier = await this.getOrderSupplierById(user, orderId, orderSupplierId);
        if (!currentOrderSupplier.parentId) {
            throw new BadRequestException({ translate: 'validation.can_not_update_first_supplier' });
        }

        if (data.supplierId && data.supplierId !== currentOrderSupplier.supplierId) {
            const parent = await this.orderSupplierRepo.findOneOrFail({
                where: { id: currentOrderSupplier.parentId },
                relations: ['supplier']
            });
            const supplier = await this.getAndCheckValidSupplier(user, parent, data.supplierId);

            if (this.isFirstOrderSupplier(currentOrderSupplier)) {
                await this.checkValidFirstOrderSupplier(supplier);
            } else {
                await this.checkValidOrderSupplier(user, supplier, parent.supplier);
            }

            await this.updateSupplierChildren(user, orderSupplierId, supplier);
        }

        await this.orderSupplierRepo.updateOrFail({ id: orderSupplierId }, data);
    }

    private isFirstOrderSupplier(orderSupplier: OrderSupplierEntity) {
        return orderSupplier.parentId === null;
    }

    async changeFirstSupplier(user: UserEntity, order: OrderEntity, supplier: FacilityEntity) {
        const orderSupplier = await this.orderSupplierRepo.findOneByOrFail({ orderId: order.id, parentId: IsNull() });

        await this.orderSupplierRepo.update({ id: orderSupplier.id }, { supplierId: supplier.id });
        await this.updateSupplierChildren(user, orderSupplier.id, supplier);
    }

    private async updateSupplierChildren(user: UserEntity, orderSupplierId: string, supplier: FacilityEntity) {
        const children: OrderSupplierEntity[] = await this.orderSupplierRepo.findBy({ parentId: orderSupplierId });

        await Promise.all(
            children.map(async (childOrderSupplier) => {
                const partner = await this.orderFacilityService.findSupplierForOrderSupplier(
                    user,
                    supplier.id,
                    childOrderSupplier.supplierId
                );

                if (partner) {
                    await this.orderSupplierRepo.updateOrFail(
                        { id: childOrderSupplier.id },
                        { fromSupplierId: supplier.id }
                    );
                } else {
                    await this.orderSupplierRepo.deleteOrFail({ id: childOrderSupplier.id });
                }
            })
        );
    }

    async deleteOrderSupplier(user: UserEntity, orderId: string, orderSupplierId: string) {
        const currentOrderSupplier = await this.getOrderSupplierById(user, orderId, orderSupplierId);

        if (!currentOrderSupplier.parentId) {
            throw new BadRequestException({ translate: 'validation.can_not_delete_first_supplier' });
        }

        return this.orderSupplierRepo.deleteOrFail({ id: orderSupplierId });
    }

    private async getAndCheckValidSupplier(user: UserEntity, parent: OrderSupplierEntity, supplierId: string) {
        const supplier = await this.orderFacilityService.findSupplierForOrderSupplier(
            user,
            parent.supplierId,
            supplierId
        );

        if (!supplier) {
            throw new NotFoundException({ translate: 'error.not_found.OrderSupplierEntity' });
        }

        return supplier;
    }

    async updateFirstSupplierTraceInfo(order: OrderEntity, data: OrderSupplierTraceInfoType) {
        await this.orderSupplierRepo.update({ orderId: order.id, parentId: IsNull() }, data);
    }

    async getOrderSuppliers(user: UserEntity, orderId: string) {
        await this.orderService.getOrderById(user, orderId);

        return this.orderSupplierRepo.getOrderSuppliers(orderId);
    }

    async checkValidFirstOrderSupplier(supplier: FacilityEntity) {
        const supplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            roleId: supplier.typeId
        });

        if (!supplyChainNode) {
            throw new UnprocessableEntityException({ translate: 'validation.supplier_not_exist_in_supply_chain_map' });
        }
    }

    async checkValidOrderSupplier(user: UserEntity, supplier: FacilityEntity, fromSupplier: FacilityEntity) {
        const supplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            fromRoleId: supplier.typeId,
            roleId: fromSupplier.typeId
        });

        if (
            !supplyChainNode &&
            (user.role.type !== RoleTypeEnum.PRODUCT || supplier.typeName !== UserRoleEnum.BROKER)
        ) {
            throw new UnprocessableEntityException({ translate: 'validation.supplier_not_exist_in_supply_chain_map' });
        }
    }
}
