import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveFieldDnaTransformationTable1655969545728 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "Transformation" DROP COLUMN "dnaIdentifier";`);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Transformation', (table) => {
            table.string('dnaIdentifier');
        });
    }
}
