import { Id, Pagination, PaginationParams, SortMultipleParams, Sorts } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { OrderEntity } from '~order/entities/order.entity';
import { OrderService } from '~order/services/order.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { CreateOrderDto } from '../dto/create-order-dto';
import { EditOrderDto } from '../dto/edit-order-dto';
import { OrderPaginationResponse } from '../response/order-pagination.response';
import { OrderWithSupplierResponse } from '../response/order-with-supplier.response';
import { OrderResponse } from '../response/order.response';

@Controller('orders')
@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.TRACE_PRODUCT))
export class OrderController extends BaseController {
    constructor(private connection: Connection, private orderService: OrderService) {
        super();
    }

    @Post()
    @ResponseModel(OrderResponse)
    @ApiOperation({ description: 'Create an order' })
    @HttpCode(HttpStatus.CREATED)
    createOrder(@CurrentUser() creator: UserEntity, @Body() dto: CreateOrderDto): Promise<OrderResponse> {
        return this.connection.transaction((manager) =>
            this.orderService.withTransaction(manager).createOrder(creator, dto)
        );
    }

    @Put(':id')
    @ApiOperation({ description: 'Edit an order' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({
        name: 'id',
        description: 'Order ID',
        type: 'string'
    })
    @AddRequestToBody()
    editOrderById(@CurrentUser() user: UserEntity, @Id() id: string, @Body() dto: EditOrderDto) {
        return this.connection.transaction((manager) =>
            this.orderService.withTransaction(manager).editOrderById(user, id, dto)
        );
    }

    @Get()
    @ResponseModel(OrderPaginationResponse)
    @ApiOperation({ description: 'Get list of orders' })
    getListOrder(
        @CurrentUser() user: UserEntity,
        @Pagination() paginationParams: PaginationParams,
        @Sorts({
            allowedFields: ['updatedAt', 'createdAt'],
            default: { sortField: 'createdAt', sortDirection: 'DESC' }
        })
        sort: SortMultipleParams[]
    ): Promise<PaginationCollection<OrderEntity>> {
        return this.orderService.getListOrder(user, paginationParams, sort);
    }

    @Delete(':id')
    @ApiOperation({ description: 'Delete an order' })
    @ApiParam({
        name: 'id',
        description: 'Order ID',
        type: 'string'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteOrder(@CurrentUser() user: UserEntity, @Id() id: string) {
        return this.orderService.deleteOrder(user, id);
    }

    @Get(':id')
    @ResponseModel(OrderWithSupplierResponse)
    @ApiOperation({ description: 'View an order' })
    @ApiParam({
        name: 'id',
        description: 'Order ID',
        type: 'string'
    })
    getOrderById(@CurrentUser() user: UserEntity, @Id() id: string): Promise<OrderEntity> {
        return this.orderService.getOrderById(user, id);
    }
}
