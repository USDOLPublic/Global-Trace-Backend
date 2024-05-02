import { Injectable } from '@nestjs/common';
import { ImportSelfAssessmentFileDto } from '~self-assessments/http/dto/import-self-assessment-file.dto';
import {
    COMMUNITY_SHEET_NAME,
    LABOR_SHEET_NAME,
    PRODUCT_SHEET_NAME
} from '~self-assessments/constants/import-saq.constant';
import { GetDataExcelService } from '~self-assessments/services/import/get-data-excel.service';
import { ImportGroupQuestionService } from '~self-assessments/services/import/saq/import-group-question.service';

@Injectable()
export class ImportSaqExcelService {
    constructor(
        private getDataExcelService: GetDataExcelService,
        private importGroupQuestionService: ImportGroupQuestionService
    ) {}

    async import(dto: ImportSelfAssessmentFileDto, fileSaq: Express.Multer.File): Promise<void> {
        const dataImport = await this.getDataExcelService.getDataFromFile(fileSaq);
        for (const sheet of dataImport) {
            switch (sheet.sheetName) {
                case PRODUCT_SHEET_NAME:
                case COMMUNITY_SHEET_NAME:
                case LABOR_SHEET_NAME:
                    await this.importGroupQuestionService.importGroupQuestion(sheet.sheetData, dto, sheet.sheetName);
                    break;
            }
        }
    }
}
