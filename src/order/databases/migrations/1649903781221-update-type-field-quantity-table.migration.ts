import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateTypeFieldQuantityTable1649903781221 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('ALTER TABLE "Order" ALTER COLUMN "quantity" TYPE VARCHAR(255)');
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Order', (table) => {
            table.dropColumn('quantity');
        });
    }
}
