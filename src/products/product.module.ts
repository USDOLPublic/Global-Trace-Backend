import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { Module, forwardRef } from '@nestjs/common';
import { FacilityItemEntity } from '~events/entities/facility-item.entity';
import { EventModule } from '~events/event.module';
import { FacilityItemRepository } from '~events/repositories/facility-item.repository';
import { FacilityItemService } from '~events/services/facility-item.service';
import { ProductDefinitionModule } from '~product-definitions/product-definition.module';
import { QrCodeBatchRepository } from '~qr-codes/repositories/qr-code-batch.repository';
import { QrCodeRepository } from '~qr-codes/repositories/qr-code.repository';
import { QrCodeService } from '~qr-codes/services/qr-code.service';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { ProductEntity } from './entities/product.entity';
import { ProductController } from './http/controllers/product.controller';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';

@Module({
    providers: [ProductService, FacilityItemService, QrCodeService],
    controllers: [ProductController],
    exports: [ProductService],
    imports: [
        TypeOrmHelperModule.forCustomRepository([
            ProductEntity,
            ProductRepository,
            FacilityItemRepository,
            QrCodeBatchRepository,
            QrCodeRepository,
            FacilityItemEntity
        ]),
        ProductDefinitionModule,
        RolePermissionModule,
        forwardRef(() => EventModule)
    ]
})
export class ProductModule {}
