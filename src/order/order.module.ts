import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { Module } from '@nestjs/common';
import { FacilityModule } from '~facilities/facility.module';
import { EventModule } from '~events/event.module';
import { OrderController } from '~order/http/controllers/order.controller';
import { OrderService } from '~order/services/order.service';
import { ProductModule } from '~products/product.module';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SelfAssessmentModule } from '~self-assessments/self-assessment.module';
import { OrderSupplierEntity } from './entities/order-supplier.entity';
import { OrderEntity } from './entities/order.entity';
import { DocumentController } from './http/controllers/document.controller';
import { OrderSupplierController } from './http/controllers/order-supplier.controller';
import { OrderTraceController } from './http/controllers/order-trace.controller';
import { OrderSupplierRepository } from './repositories/order-supplier.repository';
import { OrderRepository } from './repositories/order.repository';
import { DocumentService } from './services/document.service';
import { OrderSupplierService } from './services/order-supplier.service';
import { OrderTraceService } from './services/order-trace.service';
import { TraceService } from './services/trace.service';
import { TracingUtilityService } from './services/tracing-utility.service';
import { SupplyChainModule } from '~supply-chains/supply-chain.module';

@Module({
    providers: [
        OrderService,
        OrderSupplierService,
        OrderTraceService,
        TraceService,
        DocumentService,
        TracingUtilityService
    ],
    controllers: [OrderController, OrderSupplierController, OrderTraceController, DocumentController],
    exports: [OrderService, OrderTraceService],
    imports: [
        TypeOrmHelperModule.forCustomRepository([
            OrderRepository,
            OrderEntity,
            OrderSupplierRepository,
            OrderSupplierEntity
        ]),
        FacilityModule,
        EventModule,
        SelfAssessmentModule,
        RolePermissionModule,
        ProductModule,
        SupplyChainModule
    ]
})
export class OrderModule {}
