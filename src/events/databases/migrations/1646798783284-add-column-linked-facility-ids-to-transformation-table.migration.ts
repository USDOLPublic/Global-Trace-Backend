import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnLinkedFacilityIdsToTransformationTable1646798783284 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Transformation', (table) => {
            table.strings('linkedFacilityIds').default("'{}'");
            table.strings('linkedTransactionIds').default("'{}'");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Transformation', (table) => {
            table.dropColumn('linkedFacilityIds');
            table.dropColumn('linkedTransactionIds');
        });
    }
}
