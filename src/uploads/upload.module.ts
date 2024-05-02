import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './http/controllers/upload.controller';
import { UploadService } from './services/upload.service';

@Module({
    providers: [UploadService],
    controllers: [UploadController],
    imports: [TypeOrmModule.forFeature([])]
})
export class UploadModule {}
