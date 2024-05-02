import { Module, forwardRef } from '@nestjs/common';
import { DnaTestingService } from '~dna-testing/services/dna-testing.service';
import { DnaTestingRepository } from '~dna-testing/repositories/dna-testing.repository';
import { DnaTestingController } from '~dna-testing/http/controllers/dna-testing.controller';
import { DnaTestingEntity } from '~dna-testing/entities/dna-testing.entity';
import { FacilityModule } from '~facilities/facility.module';
import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { QrCodeModule } from '~qr-codes/qr-code.module';
import { ProductModule } from '~products/product.module';
import { DnaRiskService } from './services/dna-risk.service';
import { CategoryModule } from '~categories/category.module';

@Module({
    providers: [DnaTestingService, DnaRiskService],
    controllers: [DnaTestingController],
    exports: [DnaTestingService, DnaRiskService],
    imports: [
        RolePermissionModule,
        TypeOrmHelperModule.forCustomRepository([DnaTestingRepository, DnaTestingEntity]),
        forwardRef(() => FacilityModule),
        QrCodeModule,
        ProductModule,
        CategoryModule
    ]
})
export class DnaTestingModule {}
