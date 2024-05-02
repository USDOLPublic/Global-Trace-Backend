import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnIsManualAddedTableProduct1696212463178 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Product', (table) => {
            table.boolean('isManualAdded').default(false);
            table.jsonb('certifications').default("'{}'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Product', (table) => {
            table.dropColumn('isManualAdded');
            table.dropColumn('certifications');
        });
    }
}
