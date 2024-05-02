import { Content } from 'pdfmake/interfaces';
import {
    QR_CODE_BALE_INPUT,
    QR_CODE_BALE_NUMBER_TEXT,
    QR_CODE_GLOBAL_TRACE_LOGO,
    QR_CODE_LOT_INPUT,
    QR_CODE_LOT_NUMBER_TEXT
} from '~pdf-printer/constants/qr-code-pdf.constant';

const formatQrCode = (qrCode: string) => {
    return qrCode.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
};

export function createContent(qrCode: string): Content {
    return [
        QR_CODE_GLOBAL_TRACE_LOGO,
        {
            qr: qrCode,
            margin: [60, 20, 10, 10],
            eccLevel: 'H',
            fit: 180
        },
        {
            text: formatQrCode(qrCode),
            fontSize: 14,
            margin: [-20, 0, 0, 20],
            bold: true,
            color: '#6D6F7E'
        },
        QR_CODE_LOT_NUMBER_TEXT,
        QR_CODE_LOT_INPUT,
        QR_CODE_BALE_NUMBER_TEXT,
        QR_CODE_BALE_INPUT
    ];
}
