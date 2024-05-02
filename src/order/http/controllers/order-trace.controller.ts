import { Id, Sort, SortParams } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BaseController } from '~core/http/controllers/base.controller';
import { OrderTraceService } from '~order/services/order-trace.service';
import { TracingSupplierType } from '~order/types/tracing-supplier.type';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { GetTraceResultListResponse } from '../response/get-trace-result-list.response';
import { MappingSupplierResponse } from '../response/mapping-supplier.response';

@Controller('orders/:id/traces')
@ApiTags('OrderTrace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.TRACE_PRODUCT))
export class OrderTraceController extends BaseController {
    constructor(private orderTraceService: OrderTraceService) {
        super();
    }

    @Get()
    @ResponseModel(MappingSupplierResponse, true)
    @ApiOperation({ description: 'Trace an order' })
    @ApiParam({
        name: 'id',
        description: 'Order id',
        type: 'string'
    })
    getTraceResultMapping(@CurrentUser() user: UserEntity, @Id() id: string): Promise<MappingSupplierResponse[]> {
        return this.orderTraceService.getTraceResultMapping(user, id);
    }

    @Get('lists')
    @ResponseModel(GetTraceResultListResponse, true)
    @ApiOperation({ description: 'Get trace result list' })
    @ApiParam({
        name: 'id',
        description: 'Order id',
        type: 'string'
    })
    getTraceResultList(
        @CurrentUser() user: UserEntity,
        @Id() id: string,
        @Sort({ allowedFields: ['supplierName', 'category', 'transactedAt'], default: { sortField: 'transactedAt' } })
        sort: SortParams
    ): Promise<TracingSupplierType[]> {
        return this.orderTraceService.getTraceResultList(user, id, sort);
    }

    @Get('suppliers')
    @ResponseModel(MappingSupplierResponse, true)
    @ApiOperation({ description: 'Get list of suppliers' })
    @ApiParam({
        name: 'id',
        description: 'Order id',
        type: 'string'
    })
    getSupplierList(@CurrentUser() user: UserEntity, @Id() id: string): Promise<MappingSupplierResponse[]> {
        return this.orderTraceService.getSupplierList(user, id);
    }
}
