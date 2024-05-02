import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { forwardRef, Module } from '@nestjs/common';
import { EventModule } from '~events/event.module';
import { DocumentService } from '~order/services/document.service';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SupplyChainModule } from '~supply-chains/supply-chain.module';
import { EventEntity } from './entities/event.entity';
import { HistoryController } from './http/controllers/history.controller';
import { EventRepository } from './repositories/event.repository';
import { HistoryService } from './services/history.service';

@Module({
    providers: [HistoryService, DocumentService],
    controllers: [HistoryController],
    exports: [HistoryService],
    imports: [
        TypeOrmHelperModule.forCustomRepository([EventRepository, EventEntity]),
        forwardRef(() => EventModule),
        RolePermissionModule,
        SupplyChainModule
    ]
})
export class HistoryModule {}
