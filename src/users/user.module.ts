import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { cacheConfig } from '~config/cache.config';
import { env } from '~config/env.config';
import { DynamicLinkModule } from '~dynamic-link/dynamic-link.module';
import { FacilityModule } from '~facilities/facility.module';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { SupplyChainNodeRepository } from '~supply-chains/repositories/supply-chain-node.repository';
import { SupplyChainModule } from '~supply-chains/supply-chain.module';
import { ActorService } from '~users/services/actor.service';
import { OtpEntity } from './entities/otp.entity';
import { UserEntity } from './entities/user.entity';
import { AuthController } from './http/controllers/auth.controller';
import { PartnerController } from './http/controllers/partner.controller';
import { ResetPasswordController } from './http/controllers/reset-password.controller';
import { UserController } from './http/controllers/user.controller';
import { OtpRepository } from './repositories/otp.repository';
import { UserRepository } from './repositories/user.repository';
import { AdminService } from './services/admin.service';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { PartnerService } from './services/partner.service';
import { ResetPasswordService } from './services/reset-password.service';
import { UserService } from './services/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SiteDetailModule } from '~site-details/site-details.module';

@Module({
    providers: [
        UserService,
        AuthService,
        AdminService,
        JwtStrategy,
        ResetPasswordService,
        OtpService,
        ActorService,
        PartnerService
    ],
    controllers: [UserController, AuthController, ResetPasswordController, PartnerController],
    exports: [UserService, ActorService, PartnerService],
    imports: [
        RolePermissionModule,
        SupplyChainModule,
        forwardRef(() => FacilityModule),
        DynamicLinkModule,
        TypeOrmHelperModule.forCustomRepository([
            UserEntity,
            UserRepository,
            OtpEntity,
            OtpRepository,
            FacilityRepository,
            RoleRepository,
            SupplyChainNodeRepository
        ]),
        JwtModule.register({
            secret: env.JWT.SECRET,
            signOptions: {
                expiresIn: env.JWT.EXPIRE,
                algorithm: 'HS512'
            }
        }),
        SiteDetailModule,
        cacheConfig
    ]
})
export class UserModule {}
