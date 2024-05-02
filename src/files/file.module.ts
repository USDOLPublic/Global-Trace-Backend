import { forwardRef, Module } from '@nestjs/common';
import { FileController } from './http/controllers/file.controller';
import { FileService } from '~files/services/file.service';
import { FileEntity } from './entities/file.entity';
import { FileRepository } from './repositories/file.repository';
import { FacilityModule } from '~facilities/facility.module';
import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { RolePermissionModule } from '~role-permissions/role-permission.module';

@Module({
    providers: [FileService],
    controllers: [FileController],
    exports: [FileService],
    imports: [
        TypeOrmHelperModule.forCustomRepository([FileEntity, FileRepository]),
        forwardRef(() => FacilityModule),
        RolePermissionModule
    ]
})
export class FileModule {}
