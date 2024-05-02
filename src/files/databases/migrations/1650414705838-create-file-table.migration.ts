import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFileTable1650414705838 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('File', (table) => {
            table.primaryUuid('id');
            table.string('blobName');
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('File');
    }
}
