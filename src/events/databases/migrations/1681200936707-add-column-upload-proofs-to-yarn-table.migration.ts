import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnUploadProofsToYarnTable1681200936707 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.jsonb('uploadProofs').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.dropColumn('uploadProofs');
        });
    }
}
