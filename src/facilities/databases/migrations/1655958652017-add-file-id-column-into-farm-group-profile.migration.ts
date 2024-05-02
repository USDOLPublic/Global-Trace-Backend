import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddFileIdColumnIntoFarmGroupProfile1655958652017 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('FarmGroupProfile', (table) => {
            table.uuid('fileId').index().nullable().foreign('File');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FarmGroupProfile', (table) => {
            table.dropColumn('fileId');
        });
    }
}
