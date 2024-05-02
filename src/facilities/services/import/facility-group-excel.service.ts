import { ExcelParsingType } from '~facilities/types/excel-parsing.type';
import { ParseDataFarmGroup } from '~facilities/types/facility-groups/parse-data-farm-group.type';
import {
    FARM_UUID_COLUMN,
    FORMULA,
    HEADER_FARM_LEVEL_DEFAULT,
    HEIGHT_ROW_HEADER_SHEET_2,
    HEIGHT_ROW_HEADER_SHEET_3,
    MAXIMUM_FARMS_PER_TEMPLATE,
    RANGE,
    SHEET_1,
    SHEET_2,
    SHEET_3,
    TEMPLATE_HEADER_ROW_COUNT,
    WIDTH_COLUMN_HEADER
} from '~facilities/constants/farm-group-template.constants';
import { BadRequestException, Injectable, StreamableFile } from '@nestjs/common';
import { SelfAssessmentGroupService } from '~self-assessments/services/self-assessment-group.service';
import { InitWorkbookType } from '~facilities/types/init-workbook.type';
import { Cell, Column, Row, Workbook, Worksheet } from 'exceljs';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';
import { FarmLevelRiskExcelData } from '~facilities/types/facility-groups/xlsx-farm-level-risk-data.type';
import moment from 'moment/moment';
import { cloneDeep, flatten, map } from 'lodash';
import { checkIfBlankRow } from '~files/helpers/is-blank-row.helper';
import { initWorkbook } from '~files/helpers/file.helper';
import { HeadersExtractionType } from '~facilities/types/headers-extraction.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { Response } from 'express';
import path from 'path';
import { env } from '~config/env.config';
import { SelfAssessmentUploadFileTypeEnum } from '~self-assessments/enums/self-assessment-upload-file-type.enum';
import { StorageService } from '@diginexhk/nestjs-storage';
import { SelfAssessmentUploadFileService } from '~self-assessments/services/self-assessment-upload-file.service';
import { FacilityGroupService } from '~facilities/services/facility-group.service';
import { InstructionExcelType } from '~facilities/types/facility-groups/instruction-excel.type';
import { LABOR_SHEET_NAME, COMMUNITY_SHEET_NAME } from '~self-assessments/constants/import-saq.constant';
import { trimValue } from '~core/helpers/string.helper';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { ValidExcelQuestionData } from '~facilities/types/facility-groups/valid-excel-question-data.type';
import { FileService } from '~files/services/file.service';
import { SelfAssessmentUploadFileEntity } from '~self-assessments/entities/self-assessment-upload-file.entity';

@Injectable()
export class FacilityGroupExcelService {
    constructor(
        private facilityGroupService: FacilityGroupService,
        private selfAssessmentGroupService: SelfAssessmentGroupService,
        private storageService: StorageService,
        private selfAssessmentUploadFileService: SelfAssessmentUploadFileService,
        private fileService: FileService
    ) {}

    async validDownloadTemplate(roleId: string): Promise<void | SelfAssessmentUploadFileEntity> {
        await this.facilityGroupService.validRoleCompleteProfile(roleId);
        const selfAssessmentUploadFile = await this.selfAssessmentUploadFileService.findOne({
            where: { roleId, type: SelfAssessmentUploadFileTypeEnum.FACILITY_GROUP_TEMPLATE }
        });
        if (!selfAssessmentUploadFile) {
            throw new BadRequestException({ translate: 'error.facility_group_template_file_has_not_imported' });
        }

        return selfAssessmentUploadFile;
    }

    async getXlsxFile(res: Response, roleId: string, farmGroupId: string): Promise<void> {
        await this.facilityGroupService.validRoleCompleteProfile(roleId);
        const selfAssessmentUploadFile = await this.validDownloadTemplate(roleId);
        if (farmGroupId) {
            const { facilityGroupFile, farms, facilityGroupFileId } =
                await this.facilityGroupService.getFacilityGroupById(farmGroupId);
            if (facilityGroupFile) {
                const fileStream = await this.fileService.getFileById(facilityGroupFileId);
                return this.downloadAndSetFarmUuid(res, fileStream, farms, roleId);
            }
        }

        const { file } = selfAssessmentUploadFile as SelfAssessmentUploadFileEntity;
        return this.downloadXlsxFile(res, file.blobName, file.fileName);
    }

    private async downloadXlsxFile(res: Response, blobName: string, fileName: string): Promise<void> {
        const buffer = await this.storageService.createBufferFromBlob(blobName);
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.header('Content-Disposition', `attachment; filename="${fileName}"`);

        new StreamableFile(buffer).getStream().pipe(res);
    }

    async downloadAndSetFarmUuid(
        res: Response,
        file: Express.Multer.File | NodeJS.ReadableStream,
        farms: FacilityEntity[],
        roleId: string
    ) {
        const groups = await this.selfAssessmentGroupService.getSelfAssessmentGroupByRoleId(roleId);
        const { workbook, farmLevelRiskWorksheet } = await this.initWorkbook({
            fileOrStream: file,
            groups
        });
        farmLevelRiskWorksheet.eachRow({ includeEmpty: false }, (row: Row, rowNumber) => {
            if (rowNumber > 1 && row.getCell('id').toString()) {
                const farm = farms.find(({ farmId }) => farmId.split('-')[1] === row.getCell('id').toString());
                if (farm) {
                    row.getCell('farmUUID').value = farm.id;
                }
            }
        });
        return this.sendXlsxFile(res, workbook);
    }

    async sendXlsxFile(res: Response, xlsxWorkbook: Workbook): Promise<void> {
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.header('Content-Disposition', `attachment; filename=import-facility-group-template.xlsx`);
        const fileBuffer = Buffer.from(await xlsxWorkbook.xlsx.writeBuffer());
        new StreamableFile(fileBuffer).getStream().pipe(res);
    }

    async parseXlsx({
        file,
        groups,
        isParsingForUpdate = false,
        includeEmpty = false
    }: ExcelParsingType): Promise<ParseDataFarmGroup> {
        const { instructionWorksheet, communityRiskWorksheet, farmLevelRiskWorksheet } = await this.initWorkbook({
            fileOrStream: file,
            groups
        });

        const instruction = this.readInstructionXlsxData(instructionWorksheet);

        const communitySaqGroups = groups.filter(({ title }) => title.en === COMMUNITY_SHEET_NAME);
        const communityRisk = this.readCommunityRiskXlsxData(communityRiskWorksheet, communitySaqGroups);

        const farmLevelSaqGroups = groups.filter(({ title }) => title.en === LABOR_SHEET_NAME);
        const farmLevelRisk = this.readFarmLevelRiskXlsxData(
            farmLevelRiskWorksheet,
            farmLevelSaqGroups,
            isParsingForUpdate,
            includeEmpty
        );
        const isNotEmptySheet = farmLevelRisk.some(({ isBlankRow }) => !isBlankRow);

        if (!isNotEmptySheet) {
            throw new BadRequestException({ translate: 'error.farm_group_must_include_at_least_one_farm' });
        }

        return { instruction, communityRisk, farmLevelRisk };
    }

    async initWorkbook({ fileOrStream, groups }: InitWorkbookType) {
        const workbook = await initWorkbook(fileOrStream);
        this.validateFileStructure(workbook, groups);
        const worksheets = this.addHeaderTemplate(workbook, groups);

        const instructionWorksheet: Worksheet = workbook.getWorksheet(SHEET_1);

        return {
            workbook,
            instructionWorksheet,
            communityRiskWorksheet: worksheets.workSheet2,
            farmLevelRiskWorksheet: worksheets.workSheet3
        };
    }

    // eslint-disable-next-line max-lines-per-function
    readFarmLevelRiskXlsxData(
        worksheet: Worksheet,
        groups: SelfAssessmentGroupEntity[],
        isParsingForUpdate: boolean = false,
        includeEmpty: boolean = true
    ): FarmLevelRiskExcelData[] {
        if (worksheet.actualRowCount > MAXIMUM_FARMS_PER_TEMPLATE + TEMPLATE_HEADER_ROW_COUNT) {
            throw new BadRequestException({ translate: 'error.maximum_farms_per_template' });
        }

        const startTime = moment().unix();
        const defaultKeys = map(HEADER_FARM_LEVEL_DEFAULT, 'key');
        const groupQuestions = flatten(map(groups, 'questions'));

        const farms: FarmLevelRiskExcelData[] = [];
        worksheet.eachRow({ includeEmpty }, (row: Row, rowNumber: number) => {
            if (!isParsingForUpdate && row.getCell('farmUUID').toString()) {
                throw new BadRequestException({ translate: 'error.can_not_use_another_farm_group_template_to_upload' });
            }

            const isValidRangeOfRowToExtract =
                rowNumber > TEMPLATE_HEADER_ROW_COUNT &&
                rowNumber < MAXIMUM_FARMS_PER_TEMPLATE + TEMPLATE_HEADER_ROW_COUNT;

            const headerColumnsExceptedId = HEADER_FARM_LEVEL_DEFAULT.slice(1);
            const isValidRowToExtract =
                headerColumnsExceptedId.some(({ key }) => row.getCell(key).toString()) ||
                checkIfBlankRow(row, HEADER_FARM_LEVEL_DEFAULT);

            if (isValidRangeOfRowToExtract && isValidRowToExtract) {
                const farm: FarmLevelRiskExcelData = defaultKeys.reduce(
                    (acc: FarmLevelRiskExcelData, key: string) => ({
                        ...acc,
                        [key]:
                            key === 'certificationExpiredDate'
                                ? this.parseDateXlsx(row.getCell(key))
                                : row.getCell(key).toString()
                    }),
                    {} as FarmLevelRiskExcelData
                );

                farm.selfAssessments = this.convertGroupQuestionOfRiskData(groupQuestions, row);

                farm.farmUUID = row.getCell('farmUUID').toString();
                farm.createdAt = startTime + rowNumber;
                farm.isBlankRow = checkIfBlankRow(row, HEADER_FARM_LEVEL_DEFAULT);
                farm.rowIndex = rowNumber;
                farms.push(farm);
            }
        });

        return farms;
    }

    readInstructionXlsxData(worksheet: Worksheet): InstructionExcelType {
        return {
            farmGroupId: worksheet.getCell('B1')?.value?.toString(),
            farmGroupName: worksheet.getCell('B2')?.value?.toString(),
            country: worksheet.getCell('B3')?.value?.toString(),
            province: worksheet.getCell('B4')?.value?.toString(),
            district: worksheet.getCell('B5')?.value?.toString(),
            areas: []
        };
    }

    readCommunityRiskXlsxData(worksheet: Worksheet, groups: SelfAssessmentGroupEntity[]): ValidExcelQuestionData {
        const groupQuestions = flatten(map(groups, 'questions'));
        const dataRow = worksheet.getRow(2);
        return this.convertGroupQuestionOfRiskData(groupQuestions, dataRow);
    }

    convertGroupQuestionOfRiskData(groupQuestions: SelfAssessmentQuestionEntity[], dataRow: Row) {
        return groupQuestions.reduce((acc: ValidExcelQuestionData, groupQuestion) => {
            const questionResponseOptions = map(groupQuestion.questionResponses, 'option');
            const cellValue = dataRow.getCell(groupQuestion.id).toString();
            return {
                ...acc,
                [groupQuestion.id]: {
                    column: trimValue(groupQuestion.title.en),
                    value: trimValue(cellValue),
                    type: groupQuestion.type,
                    questionResponses: groupQuestion.questionResponses,
                    groupId: groupQuestion.groupId,
                    options: questionResponseOptions
                }
            };
        }, {} as ValidExcelQuestionData);
    }

    validateFileStructure(workbook: Workbook, groups: SelfAssessmentGroupEntity[]) {
        const workSheet1: Worksheet = workbook.getWorksheet(SHEET_1);
        const workSheet2: Worksheet = workbook.getWorksheet(SHEET_2);
        const workSheet3: Worksheet = workbook.getWorksheet(SHEET_3);
        const { communityLevelHeaders, farmLevelHeaders } = this.extractHeaders(groups);

        if (!workSheet1 || !workSheet2 || !workSheet3) {
            throw new BadRequestException({ translate: 'error.worksheet_name_mismatch' });
        }

        for (const [index, header] of Object.entries(workSheet2.getRow(1).values as string[])) {
            const communityLevelHeader = communityLevelHeaders[+index - 1].header as string;
            if (header && header.toLowerCase().trim() !== communityLevelHeader.toLowerCase().trim()) {
                throw new BadRequestException({ translate: 'error.modified_template' });
            }
        }
        for (const [index, header] of Object.entries(workSheet3.getRow(1).values as string[])) {
            const farmLevelHeader = farmLevelHeaders[+index - 1].header as string;
            if (header && header.toLowerCase().trim() !== farmLevelHeader.toLowerCase().trim()) {
                throw new BadRequestException({ translate: 'error.modified_template' });
            }
        }
    }

    addHeaderTemplate(workBook: Workbook, groups: SelfAssessmentGroupEntity[]) {
        const workSheet2: Worksheet = workBook.getWorksheet(SHEET_2);
        const workSheet3: Worksheet = workBook.getWorksheet(SHEET_3);
        const { communityLevelHeaders, farmLevelHeaders } = this.extractHeaders(groups);

        workSheet3.columns = [...farmLevelHeaders, FARM_UUID_COLUMN];
        workSheet2.columns = communityLevelHeaders;
        workSheet2.getRow(1).height = HEIGHT_ROW_HEADER_SHEET_2;
        workSheet3.getRow(1).height = HEIGHT_ROW_HEADER_SHEET_3;

        return { workSheet2, workSheet3 };
    }

    private parseDateXlsx(cell: Cell) {
        if (!cell || !cell.value) {
            return null;
        }

        if (cell.value instanceof Date) {
            return new Date(cell.toString());
        }

        const timeNumber = cell.toString() as unknown as number;
        const utcValue = Math.floor(timeNumber - 25569) * 86400;

        if (!isNaN(utcValue)) {
            const dateInfo = new Date(utcValue * 1000);
            const month = parseInt(`${dateInfo.getMonth()}`) + 1;
            const newDate = dateInfo.getFullYear() + '/' + month + '/' + dateInfo.getDate();

            return new Date(newDate);
        }

        return timeNumber;
    }

    private extractHeaders(groups: SelfAssessmentGroupEntity[]): HeadersExtractionType {
        let communityLevelHeaders: Partial<Column>[] = [];
        let farmLevelHeaders: Partial<Column>[] = [...cloneDeep(HEADER_FARM_LEVEL_DEFAULT)];
        for (const group of groups) {
            if (group.title.en === COMMUNITY_SHEET_NAME) {
                communityLevelHeaders = this.leverHeader(group);
            } else if (group.title.en === LABOR_SHEET_NAME) {
                farmLevelHeaders.push(...this.leverHeader(group));
            }
        }

        return { communityLevelHeaders, farmLevelHeaders };
    }

    private leverHeader(group: SelfAssessmentGroupEntity): Partial<Column>[] {
        return group.questions.map(({ id, title }) => ({
            header: title.en,
            key: id,
            width: WIDTH_COLUMN_HEADER
        }));
    }

    getTemplateXlsxFile(): Promise<Workbook> {
        return new Workbook().xlsx.readFile(
            path.join(env.ROOT_PATH, `static/xlsx-template/import-farm-group-template.xlsx`)
        );
    }

    formatExcelFile(workbook: Workbook): void {
        workbook.getWorksheet(SHEET_3).fillFormula(RANGE, FORMULA);
        workbook
            .getWorksheet(SHEET_3)
            .getColumn(11)
            .eachCell((cell: Cell, rowIndex: number) => {
                if (rowIndex > 1) {
                    cell.style = { ...cell.style, numFmt: 'dd/mm/yyyy' };
                }
            });
    }
}
