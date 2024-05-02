import { Module, forwardRef } from '@nestjs/common';
import { RolePermissionModule } from '~role-permissions/role-permission.module';
import { FacilityModule } from '~facilities/facility.module';
import { QrCodeEntity } from './entities/qr-code.entity';
import { QrCodeRepository } from './repositories/qr-code.repository';
import { QrCodeBatchEntity } from './entities/qr-code-batch.entity';
import { QrCodeBatchRepository } from './repositories/qr-code-batch.repository';
import { QrCodeService } from './services/qr-code.service';
import { QrCodeBatchController } from './http/controllers/qr-code-batch.controller';
import { QrCodeController } from './http/controllers/qr-code.controller';
import { PdfPrinterModule } from '~pdf-printer/pdf-printer.module';
import { QrCodeBatchService } from '~qr-codes/services/qr-code-batch.service';
import { DownloadQrCodeBatchController } from '~qr-codes/http/controllers/download-qr-code-batch.controller';
import { UserModule } from '~users/user.module';
import { ShortTokenStrategy } from '~users/strategies/short-token.strategy';
import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';

@Module({
    providers: [QrCodeService, QrCodeBatchService, ShortTokenStrategy],
    controllers: [QrCodeBatchController, QrCodeController, DownloadQrCodeBatchController],
    exports: [QrCodeService, QrCodeBatchService],
    imports: [
        RolePermissionModule,
        forwardRef(() => FacilityModule),
        TypeOrmHelperModule.forCustomRepository([
            QrCodeEntity,
            QrCodeRepository,
            QrCodeBatchEntity,
            QrCodeBatchRepository
        ]),
        PdfPrinterModule,
        forwardRef(() => UserModule)
    ]
})
export class QrCodeModule {}
