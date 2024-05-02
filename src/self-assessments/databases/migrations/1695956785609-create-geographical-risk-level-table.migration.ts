import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateGeographicalRiskLevelTable1695956785609 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('GeographicalRiskLevel', (table) => {
            table.primaryUuid('id');
            table.uuid('roleId').index().foreign('Role');
            table.uuid('entityId').index();
            table.string('entityType').index();
            table.string('riskLevel').nullable().index();
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('GeographicalRiskLevel');
    }
}
