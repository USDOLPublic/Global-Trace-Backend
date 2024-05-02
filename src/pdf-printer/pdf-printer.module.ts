import { Module } from '@nestjs/common';
import { PDF_MAKE_FACTORY } from '~pdf-printer/config/pdf-printer.config';
import { PdfService } from '~pdf-printer/services/pdf-printer.service';

@Module({
    providers: [PDF_MAKE_FACTORY, PdfService],
    exports: [PDF_MAKE_FACTORY, PdfService]
})
export class PdfPrinterModule {}
