import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { IncidentReportStatus } from '~grievance-report/enums/incident-report-status.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserEntity } from '~users/entities/user.entity';

export class GetAndSearchAssigneeQuery extends BaseQuery<UserEntity> {
    alias(): string {
        return 'User';
    }

    get roleAlias(): string {
        return 'role';
    }

    query(query: SelectQueryBuilder<UserEntity>) {
        query.innerJoinAndSelect(`${this.alias()}.${this.roleAlias}`, `${this.roleAlias}`);
        query.andWhere(`"${this.roleAlias}"."type" = :type`, {
            type: RoleTypeEnum.LABOR
        });
        query.addSelect(
            (subQuery) =>
                subQuery
                    .from('GrievanceReport', 'GrievanceReport')
                    .select('COUNT("GrievanceReport"."id")::int', 'totalAwaitingReports')
                    .where('User.id = GrievanceReport.assigneeId')
                    .andWhere({ status: IncidentReportStatus.NEW }),
            'User_totalAwaitingReports'
        );
    }

    order(query: SelectQueryBuilder<UserEntity>) {
        query.addOrderBy(`${this.roleAlias}.name`, 'ASC');
        query.addOrderBy(`${this.alias()}.firstName`, 'ASC');
        query.addOrderBy(`${this.alias()}.lastName`, 'ASC');
    }
}
