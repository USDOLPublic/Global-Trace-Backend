import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddNewFieldDnaYarnTable1655969348454 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.string('dnaIdentifier').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.dropColumn('dnaIdentifier');
        });
    }
}
