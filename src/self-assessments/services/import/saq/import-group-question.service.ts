import { RowDataType } from '~self-assessments/types/excel-to-json-result.type';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';
import { SelfAssessmentGroupService } from '~self-assessments/services/self-assessment-group.service';
import { SelfAssessmentQuestionService } from '~self-assessments/services/self-assessment-question.service';
import { SelfAssessmentQuestionResponseService } from '~self-assessments/services/self-assessment-question-response.service';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { trimValue } from '~core/helpers/string.helper';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ImportSelfAssessmentFileDto } from '~self-assessments/http/dto/import-self-assessment-file.dto';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';
import { CategoryService } from '~categories/services/category.service';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import {
    COMMUNITY_SHEET_NAME,
    PRODUCT_SHEET_NAME,
    RESPONSE_TYPE_MAPPING
} from '~self-assessments/constants/import-saq.constant';
import { ResponseOptionsType, RowGroupQuestionDataType } from '~self-assessments/types/row-group-question-data.type';
import { RowDataGroupQuestionType } from '~self-assessments/types/row-data-group-question.type';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { OptionTypeEnum } from '~self-assessments/enums/option-type.enum';
import { ILike } from 'typeorm';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';
import { ImportRow } from '~self-assessments/types/import-row.type';

type QuestionIndexType = {
    [key: string]: string;
};

@Injectable()
export class ImportGroupQuestionService {
    constructor(
        private selfAssessmentGroupService: SelfAssessmentGroupService,
        private selfAssessmentQuestionService: SelfAssessmentQuestionService,
        private selfAssessmentQuestionResponseService: SelfAssessmentQuestionResponseService,
        private categoryService: CategoryService
    ) {}

    async importGroupQuestion(
        sheetData: RowDataType[],
        dto: ImportSelfAssessmentFileDto,
        groupName: string
    ): Promise<void> {
        const group = await this.selfAssessmentGroupService.create({
            title: { en: groupName },
            order: groupName === PRODUCT_SHEET_NAME || groupName === COMMUNITY_SHEET_NAME ? 1 : 2,
            roleId: dto.roleId
        });

        let listQuestions: RowGroupQuestionDataType[] = [];
        for (const row of sheetData) {
            listQuestions = this.convertQuestion(row, listQuestions);
        }

        const questionIndex: QuestionIndexType = {};
        let responses: SelfAssessmentQuestionResponseEntity[] = [];
        let createdAt = Math.round(+new Date() / 1000);

        for (const question of listQuestions) {
            const { questionId, index, responseEntities, lastResponseCreateAt } = await this.importRow(
                question,
                group,
                createdAt
            );
            createdAt = lastResponseCreateAt;
            responses = [...responses, ...responseEntities];
            questionIndex[index] = questionId;
        }

        await this.updateRow(responses, questionIndex);
    }

    private async importRow(
        questionData: RowGroupQuestionDataType,
        group: SelfAssessmentGroupEntity,
        createdAt: number
    ): Promise<ImportRow> {
        const type = this.getType(questionData.responseType);
        if (!type) {
            throw new BadRequestException({ translate: 'validation.question_type_is_not_valid' });
        }

        const question = await this.selfAssessmentQuestionService.create({
            groupId: group.id,
            title: { en: questionData.question },
            order: questionData.index,
            type,
            isRequired: false,
            metadata: {},
            conditions: []
        });

        const responseEntities: SelfAssessmentQuestionResponseEntity[] = [];

        for (const response of questionData.responses) {
            const responseEntity = await this.createResponse(response, question, questionData, createdAt);
            responseEntities.push(responseEntity);
            createdAt += 1;
        }

        return {
            questionId: question.id,
            index: questionData.index,
            responseEntities,
            lastResponseCreateAt: createdAt
        };
    }

    private async createResponse(
        response: ResponseOptionsType,
        question: SelfAssessmentQuestionEntity,
        questionData: RowGroupQuestionDataType,
        createdAt: number
    ): Promise<SelfAssessmentQuestionResponseEntity> {
        const goTo = trimValue(response.goTo);

        let indicatorId: string = null;
        let subIndicatorId: string = null;

        if (trimValue(response.indicator)) {
            indicatorId = await this.getIndicatorId(trimValue(response.indicator));

            if (!indicatorId) {
                throw new BadRequestException({ translate: 'validation.indicator_is_not_valid' });
            }

            if (trimValue(response.subIndicator)) {
                subIndicatorId = await this.getSubIndicatorId(indicatorId, trimValue(response.subIndicator));

                if (!subIndicatorId) {
                    throw new BadRequestException({ translate: 'validation.sub_indicator_is_not_valid' });
                }
            }
        }

        return this.selfAssessmentQuestionResponseService.create({
            createdAt,
            selfAssessmentQuestionId: question.id,
            option: trimValue(response.responseOptions),
            optionType: trimValue(response.optionType) as OptionTypeEnum,
            nextQuestionId: null,
            goTo: goTo === 'End' ? null : parseInt(goTo) || questionData.index + 1,
            riskLevel: this.getRiskLevel(response.riskLevel),
            indicatorId,
            subIndicatorId,
            translation: { en: trimValue(response.responseOptions) }
        });
    }

    private getType(responseType: string): SelfAssessmentQuestionTypesEnum {
        return RESPONSE_TYPE_MAPPING[responseType] || null;
    }

    getRiskLevel(riskLevelString: string): SeverityEnum {
        switch (riskLevelString) {
            case RiskScoreLevelEnum.HIGH:
                return SeverityEnum.HIGH;
            case RiskScoreLevelEnum.MEDIUM:
                return SeverityEnum.MEDIUM;
            case RiskScoreLevelEnum.LOW:
                return SeverityEnum.LOW;
            case RiskScoreLevelEnum.NO_WEIGHT:
                return SeverityEnum.NO_WEIGHT;
            default:
                return null;
        }
    }

    async getIndicatorId(indicatorString: string): Promise<string> {
        const indicator = await this.categoryService.findOneBy({
            name: ILike(indicatorString),
            type: CategoryTypeEnum.INDICATOR
        });

        return indicator?.id;
    }

    async getSubIndicatorId(indicatorId: string, subIndicatorString: string): Promise<string> {
        if (!indicatorId) {
            return null;
        }

        const subIndicator = await this.categoryService.findOneBy({
            name: ILike(subIndicatorString),
            type: CategoryTypeEnum.SUB_INDICATOR,
            parentId: indicatorId
        });

        return subIndicator?.id;
    }

    private async updateRow(
        responseEntities: SelfAssessmentQuestionResponseEntity[],
        questionIndex: QuestionIndexType
    ) {
        for (const responseEntity of responseEntities) {
            let dataUpdate: QueryDeepPartialEntity<SelfAssessmentQuestionResponseEntity>;
            if (responseEntity.goTo && questionIndex[responseEntity.goTo]) {
                dataUpdate = {
                    nextQuestionId: questionIndex[responseEntity.goTo]
                };
            } else {
                dataUpdate = {
                    nextQuestionId: null,
                    goTo: null
                };
            }

            await this.selfAssessmentQuestionResponseService.update(responseEntity.id, dataUpdate);
        }
    }

    convertQuestion(row: RowDataType, listQuestions: RowGroupQuestionDataType[]): RowGroupQuestionDataType[] {
        const data = this.convertRow(row);
        let question: RowGroupQuestionDataType;
        question = listQuestions.find((item) => item.index === data.index);

        const response: ResponseOptionsType = {
            responseOptions: data.responseOptions,
            optionType: data.optionType,
            goTo: data.goTo,
            riskLevel: data.riskLevel,
            indicator: data.indicator,
            subIndicator: data.subIndicator
        };

        if (!question) {
            question = {
                index: data.index,
                question: data.question ? data.question.trim() : null,
                methodCollecting: data.methodCollecting,
                conditionalQuestion: data.conditionalQuestion,
                responseType: data.responseType,
                responses: [response]
            };
            listQuestions.push(question);
        } else {
            question.responses.push(response);
        }

        return listQuestions;
    }

    convertRow(row: RowDataType): RowDataGroupQuestionType {
        return {
            index: row['Index'],
            question: trimValue(row['Question']),
            methodCollecting: trimValue(row['Method of Collecting data']),
            conditionalQuestion: trimValue(row['Conditional question']),
            responseType: trimValue(row['Response Type']),
            responseOptions: trimValue(row['Response Options']),
            optionType: trimValue(row['Option Type']),
            goTo: trimValue(row['Go to']),
            riskLevel: trimValue(row['Risk category/weight']),
            indicator: trimValue(row['Indicator']),
            subIndicator: trimValue(row['Sub indicator'])
        };
    }
}
