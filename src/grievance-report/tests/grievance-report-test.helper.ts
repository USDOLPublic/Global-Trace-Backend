import faker from 'faker';
import { ReasonEnum } from '~grievance-report/enums/reason.enum';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import { TestHelper } from '~core/tests/test.helper';
import { UserEntity } from '~users/entities/user.entity';
import moment from 'moment';

export class GrievanceReportTestHelper {
    constructor(private testHelper: TestHelper) {}

    async createGrievanceReport(
        facilityId: string,
        assignee: UserEntity,
        creator: UserEntity,
        options: Partial<GrievanceReportEntity> = {}
    ) {
        return GrievanceReportRepository.make().createOne({
            facilityId: facilityId,
            reason: faker.random.objectElement<ReasonEnum>(ReasonEnum),
            location: faker.random.words(5),
            message: faker.random.words(5),
            assigneeId: assignee.id,
            creatorId: creator.id,
            latestActivityAt: moment().unix(),
            isNoFollowUp: false,
            priority: 1,
            ...options
        });
    }

    async createCommunityRiskScanReport(
        facilityId: string,
        creator: UserEntity,
        options: Partial<GrievanceReportEntity> = {}
    ) {
        return GrievanceReportRepository.make().createOne({
            facilityId: facilityId,
            location: faker.address.city(),
            recordedAt: moment().unix(),
            latestActivityAt: moment().unix(),
            message: faker.datatype.string(200),
            creatorId: creator.id,
            priority: 1,
            auditReportNumber: faker.datatype.string(),
            ...options
        });
    }
}
