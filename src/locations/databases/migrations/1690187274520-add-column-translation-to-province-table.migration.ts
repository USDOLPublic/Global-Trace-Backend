import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnTranslationToProvinceTable1690187274520 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Province', (table) => {
            table.jsonb('translation').default("'{}'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Province', (table) => {
            table.dropColumn('translation');
        });
    }
}
