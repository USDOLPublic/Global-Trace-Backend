import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { LaborRiskEntity } from '~grievance-report/entities/labor-risk.entity';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';

export class AddCreatorIdColunmLaborRiskTable1700124585839 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('LaborRisk', (table) => {
            table.uuid('creatorId').index().nullable().foreign('User');
        });

        await this.updateLaborRisk(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('LaborRisk', (table) => {
            table.dropColumn('creatorId');
        });
    }

    private async updateLaborRisk(queryRunner: QueryRunner): Promise<void> {
        const laborRisks = await queryRunner.manager.find(LaborRiskEntity, {
            where: { entityType: GrievanceReportEntity.name },
            relations: ['grievanceReport']
        });

        const preparedData = laborRisks.map((laborRick) => ({
            ...laborRick,
            creatorId: laborRick.grievanceReport.creatorId
        }));

        await queryRunner.manager.save(LaborRiskEntity, preparedData);
    }
}
