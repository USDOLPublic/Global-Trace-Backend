import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnCategoryRiskSeverityTableCategory1690306942772 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Category', (table) => {
            table.string('category').nullable();
            table.integer('riskSeverity').default(1);
        });
    }
}
