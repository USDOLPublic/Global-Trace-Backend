import assert from 'assert';
import faker from 'faker';
import moment from 'moment';
import { CategoryEntity } from '~categories/entities/category.entity';
import { CategoryTestHelper } from '~categories/tests/category-test.helper';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { GrievanceReportResponseEntity } from '~grievance-report/entities/grievance-report-response.entity';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { LaborRiskEntity } from '~grievance-report/entities/labor-risk.entity';
import { ReasonEnum } from '~grievance-report/enums/reason.enum';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import { LaborRiskRepository } from '~grievance-report/repositories/labor-risk.repository';
import { GrievanceReportTestHelper } from '~grievance-report/tests/grievance-report-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserRepository } from '~users/repositories/user.repository';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('GrievanceController (e2e)', () => {
    const testHelper = new TestHelper();
    const userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    const facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    const grievanceReportTestHelper = testHelper.getTestHelperModule(GrievanceReportTestHelper);
    const categoryTestHelper = testHelper.getTestHelperModule(CategoryTestHelper);
    let farmMonitor: UserEntity;
    let auditor: UserEntity;
    let adminUser: UserEntity;
    let ginnerFacility: FacilityEntity;
    let farmMonitorToken;
    let auditorToken;

    let indicator: CategoryEntity;
    let subIndicator: CategoryEntity;

    beforeAll(async () => {
        await testHelper.initialize();

        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);

        farmMonitor = await userTestHelper.createUser({}, UserRoleEnum.FARM_MONITOR);
        await facilityTestHelper.create(farmMonitor, UserRoleEnum.FARM_MONITOR);

        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);

        farmMonitor = await userTestHelper.createUser({}, UserRoleEnum.FARM_MONITOR);
        farmMonitorToken = await userTestHelper.getToken(farmMonitor);

        auditor = await userTestHelper.createUser({}, UserRoleEnum.AUDITOR);
        auditorToken = await userTestHelper.getToken(auditor);

        indicator = await categoryTestHelper.createIndicator();
        subIndicator = await categoryTestHelper.createSubIndicator();
    });

    afterEach(async () => {
        await testHelper.clearGrievanceReports();
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Create grievance report successfully', async () => {
        return testHelper
            .post('/grievance-reports')
            .authenticate(await userTestHelper.getToken(adminUser))
            .send({
                facilityId: ginnerFacility.id,
                reason: ReasonEnum.HIGH,
                location: faker.random.words(5),
                message: faker.random.words(5),
                assigneeId: farmMonitor.id,
                isNoFollowUp: false,
                priority: 1,
                laborRisks: [
                    {
                        indicatorId: indicator.id,
                        subIndicatorId: subIndicator.id,
                        severity: 1
                    }
                ]
            })
            .isCreated()
            .then(async ({ body }) => {
                await testHelper.visibleInDatabase(GrievanceReportEntity, {
                    facilityId: ginnerFacility.id,
                    assigneeId: farmMonitor.id,
                    creatorId: adminUser.id
                });

                expect(body.recordedAt).not.toBeNull();
                expect(body.latestActivityAt).toBeNull();

                await testHelper.visibleInDatabase(LaborRiskEntity, {
                    entityType: GrievanceReportEntity.name,
                    entityId: body.id,
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                });

                const count = await LaborRiskRepository.make().countBy({
                    entityType: GrievanceReportEntity.name,
                    entityId: body.id
                });
                expect(count).toEqual(1);
            });
    });

    it('Create grievance report successfully: with isNoFollowUp false', async () => {
        return testHelper
            .post('/grievance-reports')
            .authenticate(await userTestHelper.getToken(adminUser))
            .send({
                facilityId: ginnerFacility.id,
                reason: ReasonEnum.HIGH,
                location: faker.random.words(5),
                message: faker.random.words(5),
                assigneeId: null,
                isNoFollowUp: false,
                priority: 1,
                laborRisks: [
                    {
                        indicatorId: indicator.id,
                        subIndicatorId: subIndicator.id,
                        severity: 1
                    }
                ]
            })
            .isCreated()
            .then(async ({ body }) => {
                await testHelper.visibleInDatabase(GrievanceReportEntity, {
                    facilityId: ginnerFacility.id,
                    creatorId: adminUser.id,
                    isNoFollowUp: false
                });

                expect(body.recordedAt).not.toBeNull();
                expect(body.latestActivityAt).toBeNull();

                await testHelper.visibleInDatabase(LaborRiskEntity, {
                    entityType: GrievanceReportEntity.name,
                    entityId: body.id,
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                });
            });
    });

    it('Create grievance report not assignerId successfully', async () => {
        return testHelper
            .post('/grievance-reports')
            .authenticate(await userTestHelper.getToken(adminUser))
            .send({
                facilityId: ginnerFacility.id,
                reason: ReasonEnum.HIGH,
                location: faker.random.words(5),
                message: faker.random.words(5),
                assigneeId: null,
                isNoFollowUp: true,
                priority: 1,
                laborRisks: [
                    {
                        indicatorId: indicator.id,
                        subIndicatorId: subIndicator.id,
                        severity: 1
                    }
                ]
            })
            .isCreated()
            .then(async ({ body }) => {
                await testHelper.visibleInDatabase(GrievanceReportEntity, {
                    facilityId: ginnerFacility.id,
                    creatorId: adminUser.id,
                    isNoFollowUp: true
                });

                expect(body.recordedAt).not.toBeNull();
                expect(body.latestActivityAt).toBeNull();

                await testHelper.visibleInDatabase(LaborRiskEntity, {
                    entityType: GrievanceReportEntity.name,
                    entityId: body.id,
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                });
            });
    });

    it('Farm monitor is not allowed to create a grievance report', async () => {
        return testHelper
            .post('/grievance-reports')
            .authenticate(await userTestHelper.getToken(farmMonitor))
            .send({
                facilityId: ginnerFacility.id,
                reason: ReasonEnum.HIGH,
                location: faker.random.words(5),
                message: faker.random.words(5),
                assigneeId: '',
                isNoFollowUp: true,
                priority: 1,
                laborRisks: [
                    {
                        indicatorId: indicator.id,
                        subIndicatorId: subIndicator.id,
                        severity: 1
                    }
                ]
            })
            .isForbiddenError()
            .then(({ body }) => {
                assert.strictEqual(body.message, 'Forbidden resource');
            });
    });

    it('View grievance report successfully', async () => {
        const grievanceReport = await grievanceReportTestHelper.createGrievanceReport(
            ginnerFacility.id,
            farmMonitor,
            adminUser
        );

        return testHelper
            .get(`/grievance-reports/${grievanceReport.id}`)
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .has([
                'reason',
                'location',
                'message',
                'assigneeId',
                'isNoFollowUp',
                'recordedAt',
                'priority',
                'laborRisks'
            ])
            .then(({ body }) => {
                expect(body).toMatchObject({
                    id: grievanceReport.id,
                    facilityId: ginnerFacility.id
                });
            });
    });

    it('Edit grievance report successfully', async () => {
        const grievanceReport = await grievanceReportTestHelper.createGrievanceReport(
            ginnerFacility.id,
            farmMonitor,
            adminUser
        );

        return testHelper
            .put(`/grievance-reports/${grievanceReport.id}`)
            .authenticate(await userTestHelper.getToken(adminUser))
            .send({
                reason: ReasonEnum.HIGH,
                assigneeId: farmMonitor.id,
                isNoFollowUp: false,
                laborRisks: [
                    {
                        indicatorId: indicator.id,
                        subIndicatorId: subIndicator.id,
                        severity: 3
                    }
                ]
            })
            .isNoContent()
            .then(async () => {
                await testHelper.visibleInDatabase(GrievanceReportEntity, {
                    id: grievanceReport.id,
                    reason: ReasonEnum.HIGH,
                    assigneeId: farmMonitor.id,
                    isNoFollowUp: false
                });

                await testHelper.visibleInDatabase(LaborRiskEntity, {
                    entityType: GrievanceReportEntity.name,
                    entityId: grievanceReport.id,
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 3
                });

                const count = await LaborRiskRepository.make().countBy({
                    entityType: GrievanceReportEntity.name,
                    entityId: grievanceReport.id
                });
                expect(count).toEqual(1);
            });
    });

    it('Edit grievance report not assignerId successfully', async () => {
        let grievanceReportId: string;
        await testHelper
            .post('/grievance-reports')
            .authenticate(await userTestHelper.getToken(adminUser))
            .send({
                facilityId: ginnerFacility.id,
                location: faker.random.words(5),
                message: faker.random.words(5),
                assigneeId: null,
                isNoFollowUp: true,
                priority: 1,
                laborRisks: [
                    {
                        indicatorId: indicator.id,
                        subIndicatorId: subIndicator.id,
                        severity: 1
                    }
                ]
            })
            .isCreated()
            .then(({ body }) => {
                grievanceReportId = body.id;
            });

        return testHelper
            .put(`/grievance-reports/${grievanceReportId}`)
            .authenticate(await userTestHelper.getToken(adminUser))
            .send({
                assigneeId: null,
                isNoFollowUp: true,
                laborRisks: [
                    {
                        indicatorId: indicator.id,
                        subIndicatorId: subIndicator.id,
                        severity: 2
                    }
                ]
            })
            .isNoContent()
            .then(async () => {
                await testHelper.visibleInDatabase(GrievanceReportEntity, {
                    id: grievanceReportId,
                    assigneeId: null,
                    isNoFollowUp: true
                });

                await testHelper.visibleInDatabase(LaborRiskEntity, {
                    entityType: GrievanceReportEntity.name,
                    entityId: grievanceReportId,
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 2
                });

                const count = await LaborRiskRepository.make().countBy({
                    entityType: GrievanceReportEntity.name,
                    entityId: grievanceReportId
                });
                expect(count).toEqual(1);
            });
    });

    it('Edit grievance report failed', async () => {
        const grievanceReport = await grievanceReportTestHelper.createGrievanceReport(
            ginnerFacility.id,
            farmMonitor,
            adminUser
        );

        return testHelper
            .put(`/grievance-reports/${grievanceReport.id}`)
            .authenticate(await userTestHelper.getToken(adminUser))
            .send({ reason: ReasonEnum.HIGH, assigneeId: grievanceReport.id })
            .isValidateError()
            .then(({ body }) => {
                assert.strictEqual(body.message, 'Validate Exception');
            });
    });

    it('Admin get list of grievance reports successfully', async () => {
        await Promise.all([
            grievanceReportTestHelper.createGrievanceReport(ginnerFacility.id, farmMonitor, adminUser),
            grievanceReportTestHelper.createGrievanceReport(ginnerFacility.id, farmMonitor, adminUser),
            grievanceReportTestHelper.createCommunityRiskScanReport(ginnerFacility.id, farmMonitor),
            grievanceReportTestHelper.createCommunityRiskScanReport(ginnerFacility.id, farmMonitor)
        ]);

        return testHelper
            .get(`/grievance-reports`)
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body.total).toStrictEqual(4);
                expect(body).toHaveProperty('items');

                const report = body.items[0];
                expect(Object.keys(report)).toEqual(
                    expect.arrayContaining([
                        'id',
                        'location',
                        'message',
                        'laborRisks',
                        'reason',
                        'facilityId',
                        'creatorId',
                        'creator',
                        'assigneeId',
                        'assignee',
                        'recordedAt',
                        'uploadFiles',
                        'responses',
                        'priority'
                    ])
                );
            });
    });

    it('Auditor get list of grievance reports successfully', async () => {
        const roleAuditor = await userTestHelper.createUser({}, UserRoleEnum.AUDITOR);
        await facilityTestHelper.create(roleAuditor, UserRoleEnum.AUDITOR);

        await grievanceReportTestHelper.createCommunityRiskScanReport(ginnerFacility.id, farmMonitor);
        await grievanceReportTestHelper.createCommunityRiskScanReport(ginnerFacility.id, farmMonitor);
        const grievanceReport = await grievanceReportTestHelper.createGrievanceReport(
            ginnerFacility.id,
            roleAuditor,
            adminUser
        );

        return testHelper
            .get(`/grievance-reports`)
            .authenticate(await userTestHelper.getToken(roleAuditor))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body.items).toHaveLength(1);
                expect(Object.keys(body.items[0])).toEqual(
                    expect.arrayContaining([
                        'id',
                        'location',
                        'message',
                        'laborRisks',
                        'reason',
                        'facility',
                        'creator',
                        'createdAt'
                    ])
                );
                expect(body.items[0].id).toEqual(grievanceReport.id);
            });
    });

    it('Farm monitor get list of community risk scan report reports successfully', async () => {
        const roleFarmMonitor = await userTestHelper.createUser({}, UserRoleEnum.FARM_MONITOR);
        const roleAuditor = await userTestHelper.createUser({}, UserRoleEnum.AUDITOR);

        await grievanceReportTestHelper.createGrievanceReport(ginnerFacility.id, roleAuditor, adminUser);
        await grievanceReportTestHelper.createGrievanceReport(ginnerFacility.id, roleFarmMonitor, adminUser);
        await grievanceReportTestHelper.createCommunityRiskScanReport(ginnerFacility.id, roleFarmMonitor);

        return testHelper
            .get(`/grievance-reports`)
            .authenticate(await userTestHelper.getToken(roleFarmMonitor))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body.total).toEqual(1);

                const report = body.items[0];
                expect(Object.keys(report)).toEqual(
                    expect.arrayContaining([
                        'id',
                        'location',
                        'message',
                        'laborRisks',
                        'reason',
                        'facilityId',
                        'creatorId',
                        'creator',
                        'assigneeId',
                        'assignee',
                        'recordedAt',
                        'uploadFiles',
                        'responses',
                        'createdAt',
                        'updatedAt'
                    ])
                );
            });
    });

    it('Get list assignees successfully', async () => {
        const auditorDetail = await userTestHelper.createUser(
            { email: 'auditor1@usdol.com', firstName: 'AUDITOR 01' },
            UserRoleEnum.AUDITOR
        );
        return testHelper
            .get(`/grievance-reports/assignees`)
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .then((body) => {
                const assignee = body.body.find(({ id }) => id === auditorDetail.id);
                expect(assignee).toBeDefined();
                expect(assignee).toHaveProperty('totalAwaitingReports', 0);
                expect(assignee).toHaveProperty('role');
            });
    });

    it('Farm monitor submit community risk scan report successfully', async () => {
        const data = {
            facilityId: ginnerFacility.id,
            location: faker.address.city(),
            recordedAt: moment().unix(),
            message: faker.datatype.string(200),
            priority: 1,
            laborRisks: [
                {
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                }
            ]
        };

        return testHelper
            .post('/requests')
            .authenticate(farmMonitorToken)
            .send(data)
            .isCreated()
            .then(({ body }) => {
                expect(body.location).toEqual(data.location);
                expect(body.recordedAt).toEqual(data.recordedAt);
                expect(body.message).toEqual(data.message);
                expect(body.facilityId).toEqual(data.facilityId);
                expect(body.reason).toBeNull();
                expect(body.latestActivityAt).toBeNull();
            });
    });

    it('Ginner submit community risk scan report fail because this role do not have permission', async () => {
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);

        return testHelper
            .post('/requests')
            .authenticate(await userTestHelper.getToken(ginner))
            .send({
                facilityId: ginnerFacility.id,
                location: faker.address.city(),
                recordedAt: moment().unix(),
                message: faker.datatype.string(200),
                priority: 1,
                laborRisks: [
                    {
                        indicatorId: indicator.id,
                        subIndicatorId: subIndicator.id,
                        severity: 1
                    }
                ]
            })
            .isForbiddenError();
    });

    it('Farm monitor submit response successfully', async () => {
        const grievanceReport = await grievanceReportTestHelper.createCommunityRiskScanReport(
            ginnerFacility.id,
            farmMonitor,
            {
                assignee: farmMonitor
            }
        );
        const data = {
            recordedAt: moment().unix(),
            priority: 1,
            laborRisks: [
                {
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                }
            ],
            message: faker.datatype.string(200)
        };

        await testHelper
            .post(`/requests/${grievanceReport.id}/responses`)
            .authenticate(farmMonitorToken)
            .send(data)
            .isCreated()
            .then(async ({ body }) => {
                expect(body.recordedAt).toEqual(data.recordedAt);
                expect(body.message).toEqual(data.message);

                await testHelper.visibleInDatabase(LaborRiskEntity, {
                    entityType: GrievanceReportResponseEntity.name,
                    entityId: body.id,
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                });
            });

        const report = await GrievanceReportRepository.make().findById(grievanceReport.id, {
            relations: ['responses']
        });

        expect(report.responses.length).toEqual(1);

        const assignee = await UserRepository.make().findById(farmMonitor.id);
        assert.notStrictEqual(assignee.latestActivityAt, null);
    });

    it('Farm monitor submit response fail because not assigner to this request', async () => {
        const report = await grievanceReportTestHelper.createGrievanceReport(ginnerFacility.id, auditor, adminUser);
        const data = {
            recordedAt: moment().unix(),
            priority: 1,
            laborRisks: [
                {
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                }
            ],
            message: faker.datatype.string(200)
        };

        await testHelper
            .post(`/requests/${report.id}/responses`)
            .authenticate(farmMonitorToken)
            .send(data)
            .isNotFound();
    });

    it('Auditor submit response successfully', async () => {
        const grievanceReport = await grievanceReportTestHelper.createCommunityRiskScanReport(
            ginnerFacility.id,
            auditor,
            {
                assignee: auditor
            }
        );
        const data = {
            recordedAt: moment().unix(),
            priority: 1,
            laborRisks: [
                {
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                }
            ],
            message: faker.datatype.string(200),
            auditReportNumber: faker.datatype.string(10)
        };

        await testHelper
            .post(`/requests/${grievanceReport.id}/responses`)
            .authenticate(auditorToken)
            .send(data)
            .isCreated()
            .then(({ body }) => {
                expect(body.recordedAt).toEqual(data.recordedAt);
                expect(body.message).toEqual(data.message);
                expect(body.auditReportNumber).toEqual(data.auditReportNumber);
            });

        const report = await GrievanceReportRepository.make().findById(grievanceReport.id, {
            relations: ['responses']
        });

        expect(report.responses.length).toEqual(1);
    });

    it('Auditor submit response failed validate', async () => {
        const grievanceReport = await grievanceReportTestHelper.createCommunityRiskScanReport(
            ginnerFacility.id,
            auditor,
            {
                assignee: auditor
            }
        );
        const data = {
            recordedAt: moment(moment().add(3, 'days')).unix(),
            priority: 1,
            laborRisks: [
                {
                    indicatorId: indicator.id,
                    subIndicatorId: subIndicator.id,
                    severity: 1
                }
            ],
            message: faker.datatype.string(200),
            auditReportNumber: faker.datatype.string(10)
        };
        await testHelper
            .post(`/requests/${grievanceReport.id}/responses`)
            .authenticate(auditorToken)
            .send(data)
            .isValidateError()
            .then(({ body }) => {
                assert.strictEqual(body.message, 'Validate Exception');
                assert.strictEqual(
                    body.errors.recordedAt.messages[0],
                    'Recorded At must be same or before current time'
                );
            });
    });
});
