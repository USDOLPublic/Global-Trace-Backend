import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropColumnEntityTypeTableTransformationItem1701140182085 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('TransformationItem', (table) => {
            table.dropColumn('entityType');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FacilityItem', (table) => {
            table.string('entityType').nullable();
        });
    }
}
