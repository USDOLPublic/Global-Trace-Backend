import { Content, Margins } from 'pdfmake/interfaces';
import { env } from '~config/env.config';

export const QR_CODE_PAGE_MARGINS: Margins = [0, 10, 10, 10];

export const QR_CODE_GLOBAL_TRACE_LOGO: Content = {
    margin: [0, 10, 10, 10],
    image: `${env.ROOT_PATH}/static/images/global-trace-logo.png`,
    width: 100
};

export const QR_CODE_LOT_NUMBER_TEXT: Content = {
    text: 'Lot number',
    fontSize: 12,
    bold: true,
    margin: [-210, 0, 0, 0],
    color: '#6D6F7E'
};

export const QR_CODE_BALE_NUMBER_TEXT: Content = {
    text: 'Bale number',
    fontSize: 12,
    bold: true,
    margin: [-210, 20, 0, 0],
    color: '#6D6F7E'
};

export const QR_CODE_LOT_INPUT: Content = {
    margin: [0, 5, 0, 0],
    image: `${env.ROOT_PATH}/static/images/rectangle.png`,
    width: 300
};

export const QR_CODE_BALE_INPUT: Content = {
    margin: [0, 5, 0, 0],
    image: `${env.ROOT_PATH}/static/images/rectangle.png`,
    width: 300
};
