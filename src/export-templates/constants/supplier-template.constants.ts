/* eslint-disable @typescript-eslint/naming-convention */
import { Column, Fill } from 'exceljs';

export const WINDOWS_COMMA = '‚';

export const SHEET_1 = 'Sheet1';

export const SHEET_1_HEADER_NAMES = {
    BUSINESS_NAME: 'Business Name',
    BUSINESS_REGISTER_NUMBER: 'Business Reg. No',
    OS_ID: 'OS ID',
    FIRST_NAME: 'First Name',
    LAST_NAME: 'Last name',
    EMAIL: 'Email',
    TYPE: 'Type'
};

export const SHEET_1_HEADER_KEYS = {
    BUSINESS_NAME: 'businessName',
    BUSINESS_REGISTER_NUMBER: 'businessRegisterNumber',
    OS_ID: 'oarId',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    EMAIL: 'email',
    TYPE: 'type',
    IS_VALIDATED: 'isValidated',
    TIER_OPTIONS: 'tierOptions'
};

export const SHEET_1_TEMPLATE_HEADERS: Partial<Column>[] = [
    { header: SHEET_1_HEADER_NAMES.BUSINESS_NAME, key: SHEET_1_HEADER_KEYS.BUSINESS_NAME, width: 15 },
    {
        header: SHEET_1_HEADER_NAMES.BUSINESS_REGISTER_NUMBER,
        key: SHEET_1_HEADER_KEYS.BUSINESS_REGISTER_NUMBER,
        width: 20
    },
    {
        header: SHEET_1_HEADER_NAMES.OS_ID,
        key: SHEET_1_HEADER_KEYS.OS_ID,
        width: 15
    },
    {
        header: SHEET_1_HEADER_NAMES.FIRST_NAME,
        key: SHEET_1_HEADER_KEYS.FIRST_NAME,
        width: 15,
        style: { alignment: { wrapText: true } }
    },
    {
        header: SHEET_1_HEADER_NAMES.LAST_NAME,
        key: SHEET_1_HEADER_KEYS.LAST_NAME,
        width: 15,
        style: { alignment: { wrapText: true } }
    },
    {
        header: SHEET_1_HEADER_NAMES.EMAIL,
        key: SHEET_1_HEADER_KEYS.EMAIL,
        width: 20,
        style: { alignment: { wrapText: true } }
    },
    {
        header: SHEET_1_HEADER_NAMES.TYPE,
        key: SHEET_1_HEADER_KEYS.TYPE,
        width: 15,
        style: { alignment: { wrapText: true } }
    },
    {
        key: SHEET_1_HEADER_KEYS.IS_VALIDATED,
        width: 5,
        hidden: true
    },
    {
        key: SHEET_1_HEADER_KEYS.TIER_OPTIONS,
        width: 5,
        hidden: true
    }
];

export const SHEET_1_HEADER_CELLS = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'];

export const SHEET_1_HEADER_COLUMN_STYLE: Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'CDEDBE' }
};

export const SHEET_2 = 'Sheet 2';

export const SHEET_2_HEADER_NAMES = {
    TYPE: 'Type'
};

export const SHEET_2_TEMPLATE_HEADERS: Partial<Column>[] = [
    {
        header: SHEET_2_HEADER_NAMES.TYPE,
        key: SHEET_2_HEADER_NAMES.TYPE,
        width: 20
    }
];
