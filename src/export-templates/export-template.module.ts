import { Module } from '@nestjs/common';
import { ExportTemplateService } from '~export-templates/services/export-template.service';
import { ExportTemplateController } from './http/controllers/export-template.controller';
import { RolePermissionModule } from '~role-permissions/role-permission.module';

@Module({
    providers: [ExportTemplateService],
    controllers: [ExportTemplateController],
    imports: [RolePermissionModule]
})
export class ExportTemplateModule {}
