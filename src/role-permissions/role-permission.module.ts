import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { Module, forwardRef } from '@nestjs/common';
import { RoleHasPermissionEntity } from '~role-permissions/entities/role-has-permission.entity';
import { UserHasPermissionEntity } from '~role-permissions/entities/user-has-permission.entity';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { UserHasPermissionRepository } from '~role-permissions/repositories/user-has-permission.repository';
import { PermissionService } from '~role-permissions/services/permission.service';
import { SupplyChainModule } from '~supply-chains/supply-chain.module';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionController } from './http/controllers/permission.controller';
import { RoleController } from './http/controllers/role.controller';
import { RoleHasPermissionRepository } from './repositories/role-has-permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { HarvestSeasonService } from './services/harvest-season.service';
import { RolePermissionService } from './services/role-permission.service';
import { RoleService } from './services/role.service';
import { UserPermissionService } from './services/user-permission.service';

@Module({
    providers: [RoleService, PermissionService, RolePermissionService, UserPermissionService, HarvestSeasonService],
    controllers: [RoleController, PermissionController],
    exports: [RoleService, PermissionService, RolePermissionService, HarvestSeasonService],
    imports: [
        TypeOrmHelperModule.forCustomRepository([
            RoleEntity,
            RoleRepository,
            PermissionEntity,
            PermissionRepository,
            RoleHasPermissionEntity,
            RoleHasPermissionRepository,
            UserHasPermissionEntity,
            UserHasPermissionRepository
        ]),
        forwardRef(() => SupplyChainModule)
    ]
})
export class RolePermissionModule {}
