import faker from 'faker';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TestHelper } from '~core/tests/test.helper';
import { COMMUNITY_SHEET_NAME, LABOR_SHEET_NAME } from '~self-assessments/constants/import-saq.constant';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { SelfAssessmentUploadFileTypeEnum } from '~self-assessments/enums/self-assessment-upload-file-type.enum';
import { SelfAssessmentAnswerRepository } from '~self-assessments/repositories/self-assessment-answer.repository';
import { SelfAssessmentGroupRepository } from '~self-assessments/repositories/self-assessment-group.repository';
import { SelfAssessmentUploadFileRepository } from '~self-assessments/repositories/self-assessment-upload-file.repository';

export class SelfAssessmentTestHelper {
    constructor(private testHelper: TestHelper) {}

    async createAnswer(options: QueryDeepPartialEntity<SelfAssessmentAnswerEntity> = {}) {
        return SelfAssessmentAnswerRepository.make().createOne({
            isDraft: false,
            answer: [
                {
                    code: faker.random.arrayElement(['Yes', 'No']),
                    value: faker.random.arrayElement(['Yes', 'No']),
                    laborRiskLevel: faker.random.arrayElement(['High', 'Low'])
                }
            ],
            ...options
        });
    }

    createSelfAssessmentGroup(roleId: string) {
        return SelfAssessmentGroupRepository.make().save([
            {
                title: { en: COMMUNITY_SHEET_NAME },
                order: 1,
                roleId
            },
            {
                title: { en: LABOR_SHEET_NAME },
                order: 2,
                roleId
            }
        ]);
    }

    createSelfAssessmentUploadFile(roleId: string) {
        return SelfAssessmentUploadFileRepository.make().save([
            {
                file: { fileName: faker.internet.userName(), blobName: faker.name.jobTitle() },
                type: SelfAssessmentUploadFileTypeEnum.SAQ,
                roleId
            },
            {
                file: { fileName: faker.internet.userName(), blobName: faker.name.jobTitle() },
                type: SelfAssessmentUploadFileTypeEnum.FACILITY_GROUP_TEMPLATE,
                roleId
            }
        ]);
    }
}
