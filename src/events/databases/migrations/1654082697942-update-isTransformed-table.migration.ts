import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateIsTransformedTable1654082697942 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.boolean('isTransformed').default(false);
            table.boolean('isTransported').default(false);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.dropColumn('isTransformed');
            table.dropColumn('isTransported');
        });
    }
}
