import { Module } from '@nestjs/common';
import { BusinessDetailService } from './services/business-detail.service';
import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { BusinessDetailController } from './http/controllers/business-detail.controller';
import { BusinessDetailEntity } from './entities/business-detail.entity';
import { BusinessDetailRepository } from './repositories/business-detail.repository';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { AppLogoController } from './http/controllers/app-logo.controller';

@Module({
    providers: [BusinessDetailService],
    controllers: [BusinessDetailController, AppLogoController],
    imports: [
        RolePermissionModule,
        TypeOrmHelperModule.forCustomRepository([BusinessDetailEntity, BusinessDetailRepository])
    ],
    exports: [BusinessDetailService]
})
export class SiteDetailModule {}
