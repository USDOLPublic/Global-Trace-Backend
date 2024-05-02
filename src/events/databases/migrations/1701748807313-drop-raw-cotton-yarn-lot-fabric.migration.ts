import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropRawCottonYarnLotFabric1701748807313 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.dropTable('RawCotton');
        await queryRunner.dropTable('Yarn');
        await queryRunner.dropTable('Lot');
        await queryRunner.dropTable('Fabric');
    }
}
