import { ExcelToJsonResultType } from '~self-assessments/types/excel-to-json-result.type';
import { Workbook, Worksheet } from 'exceljs';
import { HeaderSheetType } from '~self-assessments/types/header-sheet.type';
import { BadRequestException } from '@nestjs/common';

export class GetDataExcelService {
    async getDataFromFile(file: Express.Multer.File): Promise<ExcelToJsonResultType[]> {
        const workbook = new Workbook();
        await workbook.xlsx.load(file.buffer);
        const jsonData: ExcelToJsonResultType[] = [];
        let headerRowIndex = 1;
        workbook.worksheets.forEach((sheet) => {
            const headerRow = sheet.getRow(headerRowIndex);
            if (!headerRow.cellCount) {
                return;
            }
            const keys: any = headerRow.values;
            const sheetData = this.readFile(headerRowIndex, keys, sheet);
            if (!sheetData.length) {
                throw new BadRequestException({ translate: 'error.empty_file_upload' });
            }

            jsonData.push({ sheetName: sheet.name, sheetData });
        });

        return jsonData;
    }

    async getHeaderRowsFromFile(file: Express.Multer.File): Promise<HeaderSheetType[]> {
        const workbook = new Workbook();
        try {
            await workbook.xlsx.load(file.buffer);
        } catch (error) {
            throw new BadRequestException({ translate: 'error.file_has_the_wrong_format' });
        }

        const headerRows: HeaderSheetType[] = [];
        let headerRowIndex = 1;
        workbook.worksheets.forEach((sheet) => {
            const headerRow = sheet.getRow(headerRowIndex);
            if (!headerRow.cellCount) {
                headerRows.push({ sheetName: sheet.name, headers: [] });
            } else {
                const keys: any = headerRow.values;
                headerRows.push({ sheetName: sheet.name, headers: keys });
            }
        });

        return headerRows;
    }

    private readFile(headerRowIndex: number, keys: any, sheet: Worksheet): any[] {
        const sheetData: any[] = [];
        sheet.eachRow((row, rowIndex) => {
            if (rowIndex <= headerRowIndex) {
                return;
            }
            const values = row.values;

            const rowData = {};
            for (const [i, key] of keys.entries()) {
                if (key) {
                    rowData[key] = values[i];
                }
            }
            sheetData.push(rowData);
        });
        return this.removeEmptyItemsAtTheEnd(sheetData);
    }

    private removeEmptyItemsAtTheEnd(sheetData: any[]): any[] {
        for (let i = sheetData.length - 1; i >= 0; i--) {
            const isNotEmptyRow = Object.values(sheetData[i]).some(
                (value) => value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')
            );

            if (isNotEmptyRow) {
                break;
            } else {
                sheetData.pop();
            }
        }
        return sheetData;
    }
}
