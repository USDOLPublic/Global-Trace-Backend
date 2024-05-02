import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnTranslationToDistrictTable1690187302148 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('District', (table) => {
            table.jsonb('translation').default("'{}'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('District', (table) => {
            table.dropColumn('translation');
        });
    }
}
