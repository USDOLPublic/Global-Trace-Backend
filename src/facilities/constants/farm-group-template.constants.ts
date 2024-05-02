/* eslint-disable @typescript-eslint/naming-convention */
import { Column } from 'exceljs';

export const DATE_FORMAT = 'DD/MM/YYYY';

export const SHEET_1 = 'Farm group definition';
export const SHEET_2 = 'Community Level Risk Assessment';
export const SHEET_3 = 'Facility Level Risk Assessment';
export const MAXIMUM_FARMS_PER_TEMPLATE = 100;
export const TEMPLATE_HEADER_ROW_COUNT = 1;

export const SHEET_NAMES = [SHEET_1, SHEET_2, SHEET_3] as const;

export const FORMULA = '=IF(L3="","",IF(L3<1.9,"Yes","No"))';
export const RANGE = 'M3:M101';

export const HEADER_FARM_LEVEL_DEFAULT: Partial<Column>[] = [
    { header: 'ID', key: 'id' },
    { header: 'Farm name', key: 'farmName' },
    { header: 'Tehsil', key: 'tehsil' },
    { header: 'Business Registration Number', key: 'businessRegisterNumber' },
    { header: 'Contact first name', key: 'firstNameContactor' },
    { header: 'Contact last name', key: 'lastNameContactor' },
    { header: 'Contact phone number', key: 'contactPhoneNumber' },
    { header: 'Certification', key: 'certification' },
    { header: 'Certification expiry date(Enter in dd/mm/yyyy)', key: 'certificationExpiredDate' }
];

export const WIDTH_COLUMN_HEADER = 50;
export const HEIGHT_ROW_HEADER_SHEET_2 = 60;
export const HEIGHT_ROW_HEADER_SHEET_3 = 80;

export const FARM_UUID_COLUMN = {
    key: 'farmUUID',
    hidden: true
};
