import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropColumnEntityTypeTableFacilityItem1700637286408 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('FacilityItem', (table) => {
            table.dropColumn('entityType');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FacilityItem', (table) => {
            table.string('entityType').nullable();
        });
    }
}
