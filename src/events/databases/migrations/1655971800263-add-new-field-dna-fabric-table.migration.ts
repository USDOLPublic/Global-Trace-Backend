import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddNewFieldDnaFabricTable1655971800263 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.string('dnaIdentifier').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.dropColumn('dnaIdentifier');
        });
    }
}
