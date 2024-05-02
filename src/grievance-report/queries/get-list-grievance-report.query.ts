import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { UserEntity } from '~users/entities/user.entity';
import { GrievanceReportResponseEntity } from '~grievance-report/entities/grievance-report-response.entity';

export class GetListGrievanceReportQuery extends BaseQuery<GrievanceReportEntity> {
    constructor(private sortParams: SortMultipleParams[], private assignee?: UserEntity) {
        super();
    }

    alias(): string {
        return 'GrievanceReport';
    }

    query(query: SelectQueryBuilder<GrievanceReportEntity>) {
        query
            .leftJoinAndSelect('GrievanceReport.responses', 'Response')
            .leftJoinAndSelect('GrievanceReport.laborRisks', 'LaborRisk', 'LaborRisk.entityType = :entityType', {
                entityType: GrievanceReportEntity.name
            })
            .leftJoinAndSelect('LaborRisk.indicator', 'LaborRiskIndicator')
            .leftJoinAndSelect('LaborRisk.subIndicator', 'LaborRiskSubIndicator')
            .leftJoinAndSelect(
                'Response.laborRisks',
                'ResponseLaborRisk',
                'ResponseLaborRisk.entityType = :responseEntityType',
                { responseEntityType: GrievanceReportResponseEntity.name }
            )
            .leftJoinAndSelect('ResponseLaborRisk.indicator', 'ResponseLaborRiskIndicator')
            .leftJoinAndSelect('ResponseLaborRisk.subIndicator', 'ResponseLaborRiskSubIndicator');

        if (this.assignee) {
            query.innerJoinAndSelect(`${this.alias()}.assignee`, 'assignee').where({ assigneeId: this.assignee.id });
        } else {
            query.leftJoinAndSelect(`${this.alias()}.assignee`, 'assignee');
        }

        query
            .withDeleted()
            .leftJoinAndSelect('GrievanceReport.facility', 'facility')
            .leftJoinAndSelect('GrievanceReport.creator', 'creator')
            .leftJoinAndSelect('creator.role', 'role');
    }

    order(query: SelectQueryBuilder<GrievanceReportEntity>) {
        for (const sortParam of this.sortParams) {
            if (!sortParam.field.includes('.')) {
                sortParam.field = `${this.alias()}.${sortParam.field}`;
            }

            query.addOrderBy(sortParam.field, sortParam.direction);
        }
    }
}
