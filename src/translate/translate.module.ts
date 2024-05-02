import { Module } from '@nestjs/common';
import { GoogleTranslateService } from './services/google-translate.service';

@Module({
    imports: [],
    controllers: [],
    providers: [GoogleTranslateService],
    exports: [GoogleTranslateService]
})
export class TranslateModule {}
