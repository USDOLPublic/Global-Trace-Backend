import { Injectable } from '@nestjs/common';
import { keyBy } from 'lodash';
import { In } from 'typeorm';
import { RiskSourceEnum } from '~risk-assessments/enums/risk-source.enum';
import { RiskItemType } from '~risk-assessments/types/risk-item.type';
import { SelfAssessmentQuestionResponseRepository } from '~self-assessments/repositories/self-assessment-question-response.repository';
import { SelfAssessmentRepository } from '~self-assessments/repositories/self-assessment.repository';

@Injectable()
export class SelfAssessmentQuestionRiskService {
    public constructor(
        private selfAssessmentRepo: SelfAssessmentRepository,
        private selfAssessmentQuestionResponseRepo: SelfAssessmentQuestionResponseRepository
    ) {}

    async getRiskItems(facilityIds: string[]): Promise<RiskItemType[]> {
        const selfAssessments = await this.selfAssessmentRepo.find({
            select: ['id'],
            where: { forFacilityId: In(facilityIds) },
            relations: ['answers']
        });
        if (!selfAssessments.length) {
            return [];
        }

        const riskItems: RiskItemType[] = [];
        for (const selfAssessment of selfAssessments) {
            const answerValues = selfAssessment.answers.flatMap(({ values }) => values);
            const questionResponseIds = answerValues.map(
                ({ selfAssessmentQuestionResponseId }) => selfAssessmentQuestionResponseId
            );

            const mappedAnswerValues = keyBy(answerValues, 'selfAssessmentQuestionResponseId');
            const questionResponses = await this.selfAssessmentQuestionResponseRepo.find({
                where: { id: In(questionResponseIds) },
                relations: ['question', 'indicator', 'indicator.category', 'subIndicator']
            });

            questionResponses.forEach((response) => {
                const { id, question, indicator, subIndicator, riskLevel } = response;
                riskItems.push({
                    indicator,
                    subIndicator,
                    severity: riskLevel,
                    source: RiskSourceEnum.SAQ,
                    role: null,
                    createdAt: selfAssessment.answers[0].createdAt,
                    additionData: {
                        reportMessage: null,
                        saqAnswer: {
                            question,
                            response,
                            value: mappedAnswerValues[id]?.value || null
                        }
                    }
                });
            });
        }
        return riskItems;
    }
}
