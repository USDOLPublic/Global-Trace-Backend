import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnIsDetectedToDnaTestingTable1705569060507 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('DnaTesting', (table) => {
            table.boolean('isDetected').default(false);
            table.strings('dnaIdentifiers').default('array[]::varchar[]');
        });

        await queryRunner.manager.query(
            'UPDATE "DnaTesting" SET "isDetected" = true, "dnaIdentifiers" = ARRAY["dnaIdentifier"]'
        );

        await this.update('DnaTesting', (table) => {
            table.dropColumn('dnaIdentifier');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('DnaTesting', (table) => {
            table.string('dnaIdentifier').nullable();
        });

        await queryRunner.manager.query('UPDATE "DnaTesting" SET "dnaIdentifier" = "dnaIdentifiers"[1]');

        await this.update('DnaTesting', (table) => {
            table.dropColumn('dnaIdentifiers');
            table.dropColumn('isDetected');
        });
    }
}
