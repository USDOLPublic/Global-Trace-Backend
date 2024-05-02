import { Module, forwardRef } from '@nestjs/common';
import { FacilityModule } from '~facilities/facility.module';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SupplyChainModule } from '~supply-chains/supply-chain.module';
import { UserModule } from '~users/user.module';
import { BrokerController } from './http/controllers/broker.controller';
import { PartnerController } from './http/controllers/partner.controller';
import { TransporterController } from './http/controllers/transporter.controller';
import { BrokerPartnerService } from './services/broker-partner.service';
import { BusinessPartnerService } from './services/business-partner.service';
import { TransporterPartnerService } from './services/transporter-partner.service';

@Module({
    providers: [TransporterPartnerService, BusinessPartnerService, BrokerPartnerService],
    controllers: [TransporterController, PartnerController, BrokerController],
    exports: [],
    imports: [
        forwardRef(() => UserModule),
        forwardRef(() => FacilityModule),
        forwardRef(() => RolePermissionModule),
        SupplyChainModule
    ]
})
export class BusinessPartnerModule {}
