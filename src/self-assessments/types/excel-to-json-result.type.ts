export type RowDataType = {
    [key: string]: string | any;
};

export type ExcelToJsonResultType = {
    sheetName: string;
    sheetData: RowDataType[];
};
