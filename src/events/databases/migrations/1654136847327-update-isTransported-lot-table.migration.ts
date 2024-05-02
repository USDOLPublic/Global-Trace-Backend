import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateIsTransportedLotTable1654136847327 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.boolean('isTransported').default(false);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.dropColumn('isTransported');
        });
    }
}
