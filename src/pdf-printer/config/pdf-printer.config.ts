import { Provider } from '@nestjs/common';
import { PDFMAKE_PRINTER } from '~pdf-printer/constants/pdf-make-printer.constant';
import PdfPrinter from 'pdfmake';
import { TFontDictionary } from 'pdfmake/interfaces';

export const PDF_MAKE_FACTORY: Provider = {
    provide: PDFMAKE_PRINTER,
    useFactory: async () => {
        const soraFont: TFontDictionary = await require('../../static/fonts/Sora');
        return new PdfPrinter(soraFont);
    }
};
