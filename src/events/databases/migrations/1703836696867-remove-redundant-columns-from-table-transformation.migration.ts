import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveRedundantColumnsFromTableTransformation1703836696867 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Transformation', (table) => {
            table.dropColumn('linkedFacilityIds');
            table.dropColumn('linkedTransactionIds');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Transformation', (table) => {
            table.strings('linkedFacilityIds').default("'{}'");
            table.strings('linkedTransactionIds').default("'{}'");
        });
    }
}
