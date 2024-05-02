import { Inject, Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { PDFMAKE_PRINTER } from '~pdf-printer/constants/pdf-make-printer.constant';
import { PdfPrinterInterface } from '~pdf-printer/interfaces/pdf-printer.interface';
import { Content } from 'pdfmake/interfaces';
import { QR_CODE_PAGE_MARGINS } from '~pdf-printer/constants/qr-code-pdf.constant';
import { Buffer } from 'buffer';
import { ExportedPdfByQrCodeType } from '~qr-codes/types/exported-pdf-by-qr-code.type';
import AdmZip from 'adm-zip';

@Injectable()
export class PdfService implements PdfPrinterInterface {
    constructor(@Inject(PDFMAKE_PRINTER) private pdfPrinter: PdfPrinter) {}

    createPdf(content: Content): PDFKit.PDFDocument {
        return this.pdfPrinter.createPdfKitDocument({
            pageMargins: QR_CODE_PAGE_MARGINS,
            content,
            defaultStyle: {
                font: 'Sora',
                alignment: 'center'
            },
            pageSize: 'A4'
        });
    }

    createPdfBuffer(content: Content): Promise<Buffer> {
        const pdf = this.createPdf(content);

        return new Promise((resolve: (value: Buffer) => void, reject) => {
            const chunks: Uint8Array[] = [];

            pdf.on('data', (chunk: Uint8Array) => chunks.push(chunk));
            pdf.on('end', () => resolve(Buffer.concat(chunks)));
            pdf.on('error', () => reject('Error in getPdfBuffer'));

            pdf.end();
        });
    }

    zipFilePdfs(exportedPdfsByQrCode: ExportedPdfByQrCodeType): Buffer {
        const zip = new AdmZip();

        for (const qrCode of Object.keys(exportedPdfsByQrCode)) {
            zip.addFile(`${qrCode}.pdf`, exportedPdfsByQrCode[qrCode]);
        }

        return zip.toBuffer();
    }
}
