import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddCreatorIdFieldToDnaTestingTable1697686691342 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('DnaTesting', (table) => {
            table.uuid('creatorId').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('DnaTesting', (table) => {
            table.dropColumn('creatorId');
        });
    }
}
