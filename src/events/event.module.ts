import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { Module, forwardRef } from '@nestjs/common';
import { FacilityItemRepository } from '~events/repositories/facility-item.repository';
import { RecordProductRepository } from '~events/repositories/record-product.repository';
import { TransactionItemRepository } from '~events/repositories/transaction-item.repository';
import { TransformationItemRepository } from '~events/repositories/transformation-item.repository';
import { FacilityItemService } from '~events/services/facility-item.service';
import { TransactionHistoryService } from '~events/services/transaction/transaction-history.service';
import { TransactionItemService } from '~events/services/transaction/transaction-item.service';
import { TransformationItemService } from '~events/services/transformation/transformation-item.service';
import { UploadProofService } from '~events/services/upload-proof.service';
import { FacilityModule } from '~facilities/facility.module';
import { HistoryModule } from '~history/history.module';
import { CountryEntity } from '~locations/entities/country.entity';
import { DistrictEntity } from '~locations/entities/district.entity';
import { ProvinceEntity } from '~locations/entities/province.entity';
import { CountryRepository } from '~locations/repositories/country.repository';
import { DistrictRepository } from '~locations/repositories/district.repository';
import { ProvinceRepository } from '~locations/repositories/province.repository';
import { LocationService } from '~locations/services/location.service';
import { PdfPrinterModule } from '~pdf-printer/pdf-printer.module';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';
import { ProductDefinitionModule } from '~product-definitions/product-definition.module';
import { AttributeRepository } from '~product-definitions/repositories/attribute.repository';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';
import { AttributeService } from '~product-definitions/services/attribute.service';
import { ProductModule } from '~products/product.module';
import { QrCodeModule } from '~qr-codes/qr-code.module';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SupplyChainNodeRepository } from '~supply-chains/repositories/supply-chain-node.repository';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { FacilityItemEntity } from './entities/facility-item.entity';
import { RecordProductEntity } from './entities/record-product.entity';
import { TransactionItemEntity } from './entities/transaction-item.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { TransformationItemEntity } from './entities/transformation-item.entity';
import { TransformationEntity } from './entities/transformation.entity';
import { CalculationController } from './http/controllers/calculation.controller';
import { EventController } from './http/controllers/event.controller';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransformationRepository } from './repositories/transformation.repository';
import { EventUtilityService } from './services/event-utility.service';
import { EventService } from './services/event.service';
import { MarginOfErrorService } from './services/margin-of-error.service';
import { MassBalanceService } from './services/mass-balance.service';
import { ProductActivityService } from './services/product-activity.service';
import { ProductAttributeService } from './services/product/product-attribute.service';
import { ValidateProductAttributeService } from './services/product/validate-product-attribute.service';
import { RecordProductService } from './services/record-product.service';
import { ProductFacilityService } from './services/transaction/product-facility.service';
import { ProductTransactionService } from './services/transaction/product-transaction.service';
import { ProductTransformationService } from './services/transformation/product-transformation.service';
import { TransformationHistoryService } from './services/transformation/transformation-history.service';
import { VerifyRatioService } from './services/verify-ratio.service';

@Module({
    providers: [
        EventService,
        ProductTransactionService,
        ProductFacilityService,
        ProductAttributeService,
        FacilityItemService,
        TransactionItemService,
        UploadProofService,
        TransactionHistoryService,
        RecordProductService,
        ProductTransformationService,
        TransformationItemService,
        SupplyChainService,
        AttributeService,
        ValidateProductAttributeService,
        LocationService,
        MarginOfErrorService,
        MassBalanceService,
        TransformationHistoryService,
        EventUtilityService,
        VerifyRatioService,
        ProductActivityService
    ],
    controllers: [EventController, CalculationController],
    exports: [
        EventService,
        ProductTransactionService,
        ProductFacilityService,
        ProductTransformationService,
        TransactionHistoryService,
        TransformationHistoryService,
        RecordProductService,
        UploadProofService
    ],
    imports: [
        RolePermissionModule,
        forwardRef(() => FacilityModule),
        QrCodeModule,
        forwardRef(() => HistoryModule),
        ProductDefinitionModule,
        TypeOrmHelperModule.forCustomRepository([
            TransactionEntity,
            TransactionRepository,
            SupplyChainNodeRepository,
            TransactionItemEntity,
            TransactionItemRepository,
            FacilityItemEntity,
            FacilityItemRepository,
            RoleRepository,
            ProductDefinitionRepository,
            RecordProductEntity,
            RecordProductRepository,
            TransformationItemEntity,
            TransformationItemRepository,
            AttributeEntity,
            AttributeRepository,
            DistrictEntity,
            DistrictRepository,
            ProvinceEntity,
            ProvinceRepository,
            CountryEntity,
            CountryRepository,
            TransformationEntity,
            TransformationRepository,
            RecordProductEntity
        ]),
        PdfPrinterModule,
        ProductModule
    ]
})
export class EventModule {}
