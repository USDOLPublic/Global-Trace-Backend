import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropStatusOfGrievanceReport1681714049140 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.dropColumn('status');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.integer('status').nullable();
        });
    }
}
