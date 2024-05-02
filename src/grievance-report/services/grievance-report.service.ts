import { PaginationParams, SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isNil } from 'lodash';
import moment from 'moment';
import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { GrievanceReportResponseEntity } from '~grievance-report/entities/grievance-report-response.entity';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { LaborRiskEntity } from '~grievance-report/entities/labor-risk.entity';
import { IncidentReportStatus } from '~grievance-report/enums/incident-report-status.enum';
import { CreateGrievanceReportDto } from '~grievance-report/http/dto/create-grievance-report.dto';
import { EditGrievanceReportDto } from '~grievance-report/http/dto/edit-grievance-report.dto';
import { SubmitGrievanceReportResponseDto } from '~grievance-report/http/dto/submit-grievance-report-response.dto';
import { GetAndSearchAssigneeQuery } from '~grievance-report/queries/get-and-search-assignee.query';
import { GetListGrievanceReportQuery } from '~grievance-report/queries/get-list-grievance-report.query';
import { GrievanceReportResponseRepository } from '~grievance-report/repositories/grievance-report-response.repository';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import { TimeRangeType } from '~events/types/time-range.type';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { UserEntity } from '~users/entities/user.entity';
import { UserRepository } from '~users/repositories/user.repository';
import { UserService } from '~users/services/user.service';
import { LaborRiskService } from './labor-risk.service';
import { FacilityQueueService } from '~facilities/services/facility-queue.service';

@Injectable()
export class GrievanceReportService extends TransactionService {
    constructor(
        private grievanceReportRepo: GrievanceReportRepository,
        private rolePermissionService: RolePermissionService,
        private userService: UserService,
        private userRepo: UserRepository,
        private laborRiskService: LaborRiskService,
        private grievanceReportResponseRepo: GrievanceReportResponseRepository,
        private facilityQueueService: FacilityQueueService
    ) {
        super();
    }

    async createGrievanceReport(creator: UserEntity, data: CreateGrievanceReportDto): Promise<GrievanceReportEntity> {
        const hasPermission = await this.rolePermissionService.hasPermission(
            creator,
            PermissionEnum.REFER_REPORT_FOR_FOLLOW_UP
        );
        if (!hasPermission && (data.isNoFollowUp || data.assigneeId)) {
            throw new BadRequestException({ translate: 'validation.do_not_have_permission_to_refer_report_follow_up' });
        }

        if (!data.isNoFollowUp && !isNil(data.assigneeId)) {
            const assignee = await this.userService.findOneOrFail({
                where: { id: data.assigneeId },
                relations: ['role', 'permissions']
            });

            await this.checkAssignee(assignee);
        } else {
            data.assigneeId = null;
        }

        const report = await this.grievanceReportRepo.createOne({
            ...data,
            latestActivityAt: null,
            recordedAt: moment().toDate(),
            creatorId: creator.id
        });

        await this.laborRiskService.createReportRisk(report, data.laborRisks, creator.id);
        await this.facilityQueueService.addFacilityRiskCalculation(data.facilityId);

        return report;
    }

    async getListGrievanceReport(
        user: UserEntity,
        paginationParams: PaginationParams,
        sortParams: SortMultipleParams[]
    ) {
        const canViewAllReports = await this.canViewAllReports(user);

        const result = await this.grievanceReportRepo.pagination(
            new GetListGrievanceReportQuery(sortParams, canViewAllReports ? null : user),
            paginationParams
        );
        for (const report of result.items) {
            report.responses.sort((a, b) => b.createdAt - a.createdAt);
            report.laborRisks = this.removeLaborRisksHaveNoIndicator(report.laborRisks);
            report.responses = this.removeResponsesHaveNoIndicator(report.responses);
        }

        return result;
    }

    async canViewAllReports(user: UserEntity): Promise<boolean> {
        if (user.role.type === RoleTypeEnum.ADMINISTRATOR) {
            return true;
        }
        return this.rolePermissionService.hasPermission(user, PermissionEnum.VIEW_ALL_REPORTS);
    }

    listAssignees() {
        return this.userRepo.find(new GetAndSearchAssigneeQuery());
    }

    async getGrievanceReportById(id: string, user: UserEntity): Promise<GrievanceReportEntity> {
        const grievanceReport = await this.grievanceReportRepo
            .createQueryBuilder('GrievanceReport')
            .leftJoinAndSelect('GrievanceReport.responses', 'responses')
            .leftJoinAndSelect('GrievanceReport.laborRisks', 'LaborRisk', 'LaborRisk.entityType = :entityType', {
                entityType: GrievanceReportEntity.name
            })
            .leftJoinAndSelect('LaborRisk.indicator', 'LaborRiskIndicator')
            .leftJoinAndSelect('LaborRisk.subIndicator', 'LaborRiskSubIndicator')
            .leftJoinAndSelect(
                'responses.laborRisks',
                'ResponseLaborRisk',
                'ResponseLaborRisk.entityType = :responseEntityType',
                { responseEntityType: GrievanceReportResponseEntity.name }
            )
            .leftJoinAndSelect('ResponseLaborRisk.indicator', 'ResponseLaborRiskIndicator')
            .leftJoinAndSelect('ResponseLaborRisk.subIndicator', 'ResponseLaborRiskSubIndicator')
            .orderBy('responses.createdAt', 'DESC')
            .where({ id })
            .withDeleted()
            .leftJoinAndSelect('GrievanceReport.facility', 'facility')
            .leftJoinAndSelect('GrievanceReport.creator', 'creator')
            .leftJoinAndSelect('creator.role', 'role')
            .getOne();

        grievanceReport.laborRisks = this.removeLaborRisksHaveNoIndicator(grievanceReport.laborRisks);
        grievanceReport.responses = this.removeResponsesHaveNoIndicator(grievanceReport.responses);

        const canViewAllReports = await this.canViewAllReports(user);
        if (!canViewAllReports && grievanceReport.assigneeId !== user.id) {
            throw new BadRequestException({
                translate: 'error.can_not_get_the_request_to_response_because_you_are_not_its_assignee'
            });
        }

        if (user.role.type === RoleTypeEnum.LABOR && grievanceReport.status === IncidentReportStatus.NEW) {
            await this.grievanceReportRepo.update(id, { status: IncidentReportStatus.VIEWED });
            await grievanceReport.reload();
        }

        return grievanceReport;
    }

    private removeLaborRisksHaveNoIndicator(laborRisks: LaborRiskEntity[]): LaborRiskEntity[] {
        return laborRisks.filter(({ indicator, subIndicator }) => indicator && subIndicator);
    }

    private removeResponsesHaveNoIndicator(
        responses: GrievanceReportResponseEntity[]
    ): GrievanceReportResponseEntity[] {
        for (const response of responses) {
            response.laborRisks = this.removeLaborRisksHaveNoIndicator(response.laborRisks);
        }
        return responses;
    }

    async getGrievanceReportByIdWithResponses(id: string): Promise<GrievanceReportEntity> {
        return this.grievanceReportRepo
            .createQueryBuilder('GrievanceReport')
            .leftJoinAndSelect('GrievanceReport.responses', 'responses')
            .leftJoinAndSelect('GrievanceReport.laborRisks', 'LaborRisk', 'LaborRisk.entityType = :entityType', {
                entityType: GrievanceReportEntity.name
            })
            .leftJoinAndSelect('LaborRisk.indicator', 'LaborRiskIndicator')
            .leftJoinAndSelect('LaborRisk.subIndicator', 'LaborRiskSubIndicator')
            .leftJoinAndSelect(
                'responses.laborRisks',
                'ResponseLaborRisk',
                'ResponseLaborRisk.entityType = :responseEntityType',
                { responseEntityType: GrievanceReportResponseEntity.name }
            )
            .leftJoinAndSelect('ResponseLaborRisk.indicator', 'ResponseLaborRiskIndicator')
            .leftJoinAndSelect('ResponseLaborRisk.subIndicator', 'ResponseLaborRiskSubIndicator')
            .orderBy('responses.createdAt', 'DESC')
            .where({ id })
            .getOne();
    }

    async editGrievanceReportById(id: string, data: EditGrievanceReportDto, creatorId: string): Promise<void> {
        const report = await this.grievanceReportRepo.findOneByOrFail({ id });

        if (!data.isNoFollowUp) {
            const assignee = await this.userService.findOneOrFail({
                where: { id: data.assigneeId },
                relations: ['role', 'permissions']
            });

            await this.checkAssignee(assignee);
        } else {
            data.assigneeId = null;
        }

        const { assigneeId, isNoFollowUp, reason } = data;
        await this.grievanceReportRepo.update(id, { assigneeId, isNoFollowUp, reason });

        await this.laborRiskService.updateReportRisk(report, data.laborRisks, creatorId);
    }

    private async checkAssignee(user: UserEntity) {
        const { role } = user;

        const isAssignee = role.type === RoleTypeEnum.LABOR;

        if (!isAssignee) {
            throw new BadRequestException({ translate: 'error.user_not_assignee' });
        }
    }

    async submitGrievanceReportResponse(
        reportId: string,
        requester: UserEntity,
        data: SubmitGrievanceReportResponseDto
    ): Promise<GrievanceReportResponseEntity> {
        const canViewAllReports = await this.rolePermissionService.hasPermission(
            requester,
            PermissionEnum.VIEW_ALL_REPORTS
        );
        const condition: FindOptionsWhere<GrievanceReportEntity> = { id: reportId };
        if (!canViewAllReports) {
            condition.assigneeId = requester.id;
        }
        const grievanceReport = await this.grievanceReportRepo.findOneByOrFail(condition);

        const responseData = { grievanceReportId: reportId, ...data };
        const response = await this.grievanceReportResponseRepo.createOne(responseData);
        await this.laborRiskService.createReportRisk(response, data.laborRisks, requester.id);

        const updateData: Partial<GrievanceReportEntity> = {
            priority: data.priority,
            status: IncidentReportStatus.RESPONSED_SENT,
            latestActivityAt: moment().toDate()
        };

        await this.grievanceReportRepo.update(reportId, updateData);
        await this.userRepo.update(requester.id, { latestActivityAt: moment().unix() });
        await this.facilityQueueService.addFacilityRiskCalculation(grievanceReport.facilityId);

        return response;
    }

    async checkIfFacilityReportedInTimeRange(facilityId: string, timeRange: TimeRangeType<number>) {
        const from: Date = timeRange.from ? moment.unix(timeRange.from).startOf('day').toDate() : null;
        const to: Date = timeRange.to ? moment.unix(timeRange.to).endOf('day').toDate() : null;

        const query = this.grievanceReportRepo.createQueryBuilder('GrievanceReport').where({ facilityId });

        if (from) {
            query.andWhere({ createdAt: MoreThanOrEqual(from) });
        }
        if (to) {
            query.andWhere({ createdAt: LessThanOrEqual(to) });
        }

        return !!(await query.getOne());
    }
}
