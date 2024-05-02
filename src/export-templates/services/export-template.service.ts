import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { Buffer, Workbook, Worksheet } from 'exceljs';
import { cloneDeep, flatten, range } from 'lodash';
import { SelectableCell } from '~export-templates/interfaces/selectable-cell.interface';
import {
    SHEET_1_TEMPLATE_HEADERS,
    SHEET_1_HEADER_COLUMN_STYLE,
    SHEET_1_HEADER_CELLS,
    SHEET_2_TEMPLATE_HEADERS,
    SHEET_2,
    SHEET_1
} from '~export-templates/constants/supplier-template.constants';
import { RoleService } from '~role-permissions/services/role.service';

@Injectable()
export class ExportTemplateService {
    constructor(private roleService: RoleService) {}

    get templateSheetExcelHeaders() {
        return cloneDeep(SHEET_1_TEMPLATE_HEADERS);
    }

    get typeNoteSheetExcelHeaders() {
        return cloneDeep(SHEET_2_TEMPLATE_HEADERS);
    }

    addSelect(selectCells: SelectableCell[], worksheet: Worksheet): void {
        for (const { options, index, nullable } of selectCells) {
            worksheet.getCell(index).dataValidation = {
                type: 'list',
                allowBlank: nullable,
                formulae: [options],
                showErrorMessage: true,
                errorStyle: 'error',
                error: 'The value Valid'
            };
        }
    }

    getSelectionCells(roleNames: string[]): SelectableCell[] {
        return flatten(
            range(2, 101).map((index) => [
                {
                    index: `G${index}`,
                    options: `"${roleNames.join(',')}"`,
                    nullable: true
                }
            ])
        );
    }

    private buildTemplateSheet(workbook: Workbook, roleNames: string[]): void {
        const worksheet: Worksheet = workbook.addWorksheet(SHEET_1);
        worksheet.columns = this.templateSheetExcelHeaders;

        this.addSelect(this.getSelectionCells(roleNames), worksheet);
    }

    private buildTypeNoteSheet(workbook: Workbook, roleNames: string[]): void {
        const worksheet: Worksheet = workbook.addWorksheet(SHEET_2, { state: 'hidden' });
        worksheet.columns = this.typeNoteSheetExcelHeaders;

        range(2, roleNames.length + 2).forEach((rowIndex: number) => {
            worksheet.getRow(rowIndex).values = [roleNames[rowIndex - 2]];
        });
    }

    private formatExcel(workbook: Workbook) {
        const worksheet1: Worksheet = workbook.getWorksheet(SHEET_1);
        for (let header of SHEET_1_HEADER_CELLS) {
            worksheet1.getCell(header).fill = SHEET_1_HEADER_COLUMN_STYLE;
        }

        worksheet1.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    }

    async createWorkbook(): Promise<Buffer> {
        const roleNames = await this.roleService.getSupplierRoleNames();
        const workbook = new Workbook();

        this.buildTemplateSheet(workbook, roleNames);
        this.buildTypeNoteSheet(workbook, roleNames);
        this.formatExcel(workbook);

        return workbook.xlsx.writeBuffer();
    }

    async exportExcel(res: Response): Promise<Response> {
        const buffer: Buffer = await this.createWorkbook();
        res.attachment(`import-suppliers-template.xlsx`);
        return res.send(buffer);
    }
}
