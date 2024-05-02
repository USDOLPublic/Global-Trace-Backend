import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnTranslationToCountryTable1690187230069 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Country', (table) => {
            table.jsonb('translation').default("'{}'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Country', (table) => {
            table.dropColumn('translation');
        });
    }
}
