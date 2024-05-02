import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateLaborRiskTable1680166698432 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('LaborRisk', (table) => {
            table.primaryUuid('id');
            table.uuid('entityId');
            table.string('entityType');
            table.uuid('indicatorId').index().foreign('Category');
            table.uuid('subIndicatorId').index().foreign('Category');
            table.integer('severity');
            table.createdAt();
            table.updatedAt();
        });

        await queryRunner.manager.query(
            'CREATE INDEX "LaborRisk_Index_entityId_entityType" ON "LaborRisk" ("entityId", "entityType");'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('LaborRisk');
    }
}
