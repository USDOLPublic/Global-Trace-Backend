import { Id } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { OrderSupplierService } from '~order/services/order-supplier.service';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { AddOrderSupplierDto } from '../dto/add-order-supplier.dto';
import { EditOrderSupplierDto } from '../dto/edit-order-supplier.dto';
import { OrderSupplierResponse } from '../response/order-supplier.response';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';

@Controller('orders/:id/suppliers')
@ApiTags('OrderSupplier')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.TRACE_PRODUCT))
export class OrderSupplierController extends BaseController {
    constructor(private orderSupplierService: OrderSupplierService, private connection: Connection) {
        super();
    }

    @Post()
    @ResponseModel(OrderSupplierResponse)
    @ApiOperation({ description: 'Add new supplier for order tracing' })
    @ApiParam({
        name: 'id',
        description: 'Order id',
        type: 'string'
    })
    @HttpCode(HttpStatus.CREATED)
    @AddRequestToBody()
    addOrderSupplier(
        @CurrentUser() user: UserEntity,
        @Id() orderId: string,
        @Body() dto: AddOrderSupplierDto
    ): Promise<OrderSupplierResponse> {
        return this.orderSupplierService.addOrderSupplier({ user, orderId, data: dto });
    }

    @Get(':orderSupplierId')
    @ResponseModel(OrderSupplierResponse)
    @ApiOperation({ description: 'View order supplier' })
    @ApiParam({
        name: 'id',
        description: 'Order supplier id',
        type: 'string'
    })
    getOrderSupplier(
        @CurrentUser() user: UserEntity,
        @Id() orderId: string,
        @Id({ key: 'orderSupplierId', nullable: false }) orderSupplierId: string
    ): Promise<OrderSupplierResponse> {
        return this.orderSupplierService.getOrderSupplierById(user, orderId, orderSupplierId);
    }

    @Put(':orderSupplierId')
    @ApiOperation({ description: 'Edit supplier for order tracing' })
    @ApiParam({
        name: 'id',
        description: 'Order supplier id',
        type: 'string'
    })
    @HttpCode(HttpStatus.CREATED)
    editOrderSupplier(
        @CurrentUser() user: UserEntity,
        @Id() orderId: string,
        @Id({ key: 'orderSupplierId', nullable: false }) orderSupplierId: string,
        @Body() dto: EditOrderSupplierDto
    ) {
        return this.connection.transaction((manager) =>
            this.orderSupplierService.withTransaction(manager).editOrderSupplier(user, orderId, orderSupplierId, dto)
        );
    }

    @Delete(':orderSupplierId')
    @ApiOperation({ description: 'Delete order supplier' })
    @ApiParam({
        name: 'id',
        description: 'Order id',
        type: 'string'
    })
    @ApiParam({
        name: 'orderSupplierId',
        description: 'Order supplier id',
        type: 'string'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteOrderSupplier(
        @CurrentUser() user: UserEntity,
        @Id() orderId: string,
        @Id({ key: 'orderSupplierId', nullable: false }) orderSupplierId: string
    ) {
        return this.orderSupplierService.deleteOrderSupplier(user, orderId, orderSupplierId);
    }
}
