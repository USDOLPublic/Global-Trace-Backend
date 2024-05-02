import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateIsTransformedTable1654082313775 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.boolean('isTransformed').default(false);
            table.boolean('isTransported').default(false);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.dropColumn('isTransformed');
            table.dropColumn('isTransported');
        });
    }
}
