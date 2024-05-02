import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnTranslationToCategoryTable1690443790629 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Category', (table) => {
            table.jsonb('translation').default("'{}'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Category', (table) => {
            table.dropColumn('translation');
        });
    }
}
