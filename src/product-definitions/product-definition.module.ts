import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { Module } from '@nestjs/common';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SupplyChainNodeRepository } from '~supply-chains/repositories/supply-chain-node.repository';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { AttributeFileEntity } from './entities/attribute-file.entity';
import { AttributeEntity } from './entities/attribute.entity';
import { ProductDefinitionAttributeEntity } from './entities/product-definition-attribute.entity';
import { ProductDefinitionFileEntity } from './entities/product-definition-file.entity';
import { ProductDefinitionEntity } from './entities/product-definition.entity';
import { AttributeController } from './http/controllers/attribute.controller';
import { ProductDefinitionController } from './http/controllers/product-definition.controller';
import { ProductTranslationController } from './http/controllers/product-translation.controller';
import { AttributeFileRepository } from './repositories/attribute-file.repository';
import { AttributeRepository } from './repositories/attribute.repository';
import { ProductDefinitionAttributeRepository } from './repositories/product-definition-attribute.repository';
import { ProductDefinitionFileRepository } from './repositories/product-definition-file.repository';
import { ProductDefinitionRepository } from './repositories/product-definition.repository';
import { AttributeService } from './services/attribute.service';
import { ProductDefinitionService } from './services/product-definition.service';
import { ProductTranslationService } from './services/product-translation.service';

@Module({
    providers: [ProductDefinitionService, AttributeService, ProductTranslationService, SupplyChainService],
    exports: [ProductDefinitionService],
    controllers: [ProductDefinitionController, AttributeController, ProductTranslationController],
    imports: [
        TypeOrmHelperModule.forCustomRepository([
            AttributeRepository,
            AttributeEntity,
            ProductDefinitionRepository,
            ProductDefinitionEntity,
            ProductDefinitionAttributeRepository,
            ProductDefinitionAttributeEntity,
            AttributeFileEntity,
            AttributeFileRepository,
            ProductDefinitionFileEntity,
            ProductDefinitionFileRepository,
            SupplyChainNodeRepository
        ]),
        RolePermissionModule
    ]
})
export class ProductDefinitionModule {}
