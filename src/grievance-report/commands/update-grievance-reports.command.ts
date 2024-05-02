import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@diginexhk/nestjs-command';
import { Workbook, Worksheet } from 'exceljs';
import path from 'path';
import { env } from '~config/env.config';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import { groupBy, keyBy } from 'lodash';
import moment from 'moment';
import { CategoryService } from '~categories/services/category.service';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { LaborRiskService } from '~grievance-report/services/labor-risk.service';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';

@Command({
    signature: 'update-grievance-reports',
    description: 'Update indicators, sub-indicators of grievance reports on UAT'
})
@Injectable()
export class UpdateGrievanceReportsCommand extends BaseCommand {
    constructor(
        private grievanceReportRepo: GrievanceReportRepository,
        private laborRiskService: LaborRiskService,
        private categoryService: CategoryService
    ) {
        super();
    }

    public async handle() {
        const reports = await this.grievanceReportRepo.find();
        const indicators = await this.categoryService.all({ type: CategoryTypeEnum.INDICATOR });
        const subIndicators = await this.categoryService.all({ type: CategoryTypeEnum.SUB_INDICATOR });
        const mapIndicator = keyBy(indicators, 'name');
        const mapSubIndicator = keyBy(subIndicators, 'name');

        const reportData = await this.getExcelData();

        const messageGroups = Object.entries(groupBy(reportData, 'message'));
        for (const [message, messageGroup] of messageGroups) {
            const createdAtGroups = Object.values(groupBy(messageGroup, 'createdAt'));
            for (const createdAtGroup of createdAtGroups) {
                const report = reports.find(
                    (item) =>
                        message === item.message &&
                        moment.unix(item.createdAt).diff(moment(createdAtGroup[0].createdAt), 'seconds') === 0
                );
                if (report) {
                    const laborRisks = createdAtGroup.map(({ indicator, subIndicator, severity }) => ({
                        indicatorId: mapIndicator[indicator].id,
                        subIndicatorId: mapSubIndicator[subIndicator].id,
                        severity: SeverityEnum[severity.toUpperCase()]
                    }));
                    await this.laborRiskService.createReportRisk(report, laborRisks);
                } else {
                    console.log(`Not found: ${message}`);
                }
            }
        }
    }

    private async getExcelData(): Promise<
        { message: string; indicator: string; subIndicator: string; severity: string; createdAt: Date }[]
    > {
        const workbook = await new Workbook().xlsx.readFile(
            path.join(env.ROOT_PATH, 'static/grievance-reports/grievance-reports.xlsx')
        );

        const reportData: {
            message: string;
            indicator: string;
            subIndicator: string;
            severity: string;
            createdAt: Date;
        }[] = [];

        const worksheet: Worksheet = workbook.getWorksheet('Sheet1');
        worksheet.eachRow((row, rowIndex) => {
            if (rowIndex <= 1) {
                return;
            }

            reportData.push({
                message: row.getCell('C').toString(),
                indicator: row.getCell('E').toString(),
                subIndicator: row.getCell('F').toString(),
                severity: row.getCell('G').toString(),
                createdAt: row.getCell('H').value as Date
            });
        });

        return reportData;
    }
}
