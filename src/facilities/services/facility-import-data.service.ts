import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { FarmLevelRiskExcelData } from '~facilities/types/facility-groups/xlsx-farm-level-risk-data.type';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { SelfAssessmentService } from '~self-assessments/services/self-assessment.service';
import { SelfAssessmentAnswerService } from '~self-assessments/services/self-assessment-answer.service';
import moment from 'moment';
import { FacilityOperationService } from '~facilities/services/facility-operation.service';
import {
    ExcelQuestionData,
    ValidExcelQuestionData
} from '~facilities/types/facility-groups/valid-excel-question-data.type';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { AnswerValue } from '~self-assessments/types/answer-value.type';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';
import { In } from 'typeorm';
import { keyBy } from 'lodash';

@Injectable()
export class FacilityImportDataService extends TransactionService {
    constructor(
        private facilityRepo: FacilityRepository,
        @Inject(forwardRef(() => SelfAssessmentService))
        private selfAssessmentService: SelfAssessmentService,
        @Inject(forwardRef(() => SelfAssessmentAnswerService))
        private selfAssessmentAnswerService: SelfAssessmentAnswerService,
        private facilityOperationService: FacilityOperationService
    ) {
        super();
    }

    async importFarms(facility: FacilityEntity, data: FarmLevelRiskExcelData[]): Promise<FacilityEntity[]> {
        let farmItems = await this.facilityOperationService.mapDataFarmItems(data, facility);
        const mappedFarms = keyBy(facility.farms, 'farmId');
        farmItems = farmItems.map((item) => {
            if (mappedFarms[item.farmId]) {
                item.id = mappedFarms[item.farmId].id;
            }
            return item;
        });

        return this.facilityRepo.save(farmItems);
    }

    async updateFarms(
        farmId: string,
        facilityGroup: FacilityEntity,
        farmLevelRisk: FarmLevelRiskExcelData[]
    ): Promise<FacilityEntity[]> {
        if (!facilityGroup?.farms.length) {
            return;
        }
        const farmIds = facilityGroup.farms.map((facility) => facility.farmId.split('-')[1]);
        const excelFarmIds = farmLevelRisk.map((farm) => farm.id);
        const visibleDBfarmIds = farmIds.filter((item) => !excelFarmIds.includes(item));
        await this.facilityRepo.delete({
            farmId: In(visibleDBfarmIds.map((item) => `${facilityGroup.farmId}-${item}`))
        });
        facilityGroup.farmId = farmId;
        return this.importFarms(facilityGroup, farmLevelRisk);
    }

    async createFarmSelfAssessment(facilityId: string, selfAssessmentData: ValidExcelQuestionData, roleId: string) {
        let selfAssessment = await this.selfAssessmentService.getOrCreateSelfAssessment(roleId, facilityId);
        const fillAnswers: Partial<SelfAssessmentAnswerEntity>[] = [];
        let values: AnswerValue[] = [];

        for (const [selfAssessmentQuestionId, selfAssessmentExcel] of Object.entries(selfAssessmentData)) {
            const { groupId } = selfAssessmentExcel;
            if (!selfAssessmentExcel.value) {
                continue;
            }
            values = this.handleValueAnswers(selfAssessmentExcel);
            fillAnswers.push({
                groupId,
                selfAssessmentQuestionId,
                selfAssessmentId: selfAssessment.id,
                values,
                isDraft: false
            });
        }

        const answers = await this.selfAssessmentAnswerService.createMany(fillAnswers);
        await this.selfAssessmentService.updateSelfAssessmentState(selfAssessment.id, {
            completedSaqAt: moment().toDate()
        });
        selfAssessment = await this.selfAssessmentService.getByFacilityId(facilityId);
        selfAssessment.answers = answers;

        return selfAssessment;
    }

    private handleValueAnswers(selfAssessmentExcel: ExcelQuestionData): AnswerValue[] {
        let { type, value, questionResponses } = selfAssessmentExcel;
        if (type === SelfAssessmentQuestionTypesEnum.ONE_CHOICE && value === '0') {
            value = '0%';
        }
        if (type === SelfAssessmentQuestionTypesEnum.MULTI_CHOICE) {
            const answerValues = value.split('|');

            return answerValues.map((val) => {
                const selfAssessmentQuestionResponseId = questionResponses.find((item) => item.option === val).id;
                return {
                    value: val,
                    selfAssessmentQuestionResponseId
                };
            });
        }
        const questionResponse =
            questionResponses.length > 1
                ? questionResponses.find((item) => item.option === value)
                : questionResponses[0];

        return [
            {
                value,
                selfAssessmentQuestionResponseId: questionResponse.id
            }
        ];
    }
}
