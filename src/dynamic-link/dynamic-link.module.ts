import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DynamicLinkService } from '~dynamic-link/services/dynamic-link.service';

@Module({
    providers: [DynamicLinkService],
    imports: [HttpModule],
    exports: [DynamicLinkService]
})
export class DynamicLinkModule {}
