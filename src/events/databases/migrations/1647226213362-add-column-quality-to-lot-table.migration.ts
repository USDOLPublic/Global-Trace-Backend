import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnQualityToLotTable1647226213362 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.string('trashContent').nullable();
            table.integer('moistureLevel').nullable();
            table.string('cottonCertification').nullable();
            table.string('grade').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.dropColumn('trashContent');
            table.dropColumn('moistureLevel');
            table.dropColumn('cottonCertification');
            table.dropColumn('grade');
        });
    }
}
