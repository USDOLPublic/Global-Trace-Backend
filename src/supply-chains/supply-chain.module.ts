import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { Module, forwardRef } from '@nestjs/common';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SupplyChainNodeEntity } from './entities/supply-chain-node.entity';
import { SupplyChainNodeController } from './http/controllers/supply-chain-node.controller';
import { SupplyChainController } from './http/controllers/supply-chain.controller';
import { SupplyChainNodeRepository } from './repositories/supply-chain-node.repository';
import { SupplyChainService } from './services/supply-chain.service';

@Module({
    providers: [SupplyChainService],
    controllers: [SupplyChainController, SupplyChainNodeController],
    imports: [
        TypeOrmHelperModule.forCustomRepository([SupplyChainNodeEntity, SupplyChainNodeRepository]),
        forwardRef(() => RolePermissionModule)
    ],
    exports: [SupplyChainService]
})
export class SupplyChainModule {}
