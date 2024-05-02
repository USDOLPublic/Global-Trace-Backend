import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableRiskAssessment1694417598522 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('RiskAssessment', (table) => {
            table.primaryUuid('id');
            table.createdAt();
            table.updatedAt();
            table.string('methodology');
            table.decimal('saqsWeight', 14, 2).nullable();
            table.decimal('hotlineWeight', 14, 2).nullable();
            table.decimal('reportsWeight', 14, 2).nullable();
            table.decimal('auditorsWeight', 14, 2).nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('RiskAssessment');
    }
}
