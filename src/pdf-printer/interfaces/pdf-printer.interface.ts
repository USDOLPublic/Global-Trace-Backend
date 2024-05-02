import { Content } from 'pdfmake/interfaces';
import { ExportedPdfByQrCodeType } from '~qr-codes/types/exported-pdf-by-qr-code.type';

export interface PdfPrinterInterface {
    createPdf: (content: Content) => PDFKit.PDFDocument;
    createPdfBuffer: (content: Content) => Promise<Buffer>;
    zipFilePdfs: (exportedPdfsByQrCode: ExportedPdfByQrCodeType) => Buffer;
}
