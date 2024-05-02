import { Column, Row } from 'exceljs';

export function checkIfBlankRow(row: Row, headers: Partial<Column>[]): boolean {
    return headers.every(({ key }) => !row.getCell(key).toString());
}
