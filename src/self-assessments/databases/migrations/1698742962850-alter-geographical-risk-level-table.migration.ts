import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterGeographicalRiskLevelTable1698742962850 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GeographicalRiskLevel', (table) => {
            table.uuid('countryId');
            table.integer('risk');
            table.dropColumn('roleId');
            table.dropColumn('entityId');
            table.dropColumn('entityType');
            table.dropColumn('riskLevel');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GeographicalRiskLevel', (table) => {
            table.dropColumn('countryId');
            table.dropColumn('risk');
            table.uuid('roleId').index().foreign('Role');
            table.uuid('entityId').index();
            table.string('entityType').index();
            table.string('riskLevel').nullable().index();
        });
    }
}
