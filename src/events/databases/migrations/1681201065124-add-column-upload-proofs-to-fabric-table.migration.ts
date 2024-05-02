import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnUploadProofsToFabricTable1681201065124 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.jsonb('uploadProofs').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.dropColumn('uploadProofs');
        });
    }
}
