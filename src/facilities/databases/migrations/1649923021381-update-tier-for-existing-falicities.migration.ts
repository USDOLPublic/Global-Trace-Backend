import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateTierForExistingFalicities1649923021381 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('UPDATE "Facility" SET "tier" = \'5 - Raw material extraction\' WHERE "type" = 1');
        await queryRunner.query('UPDATE "Facility" SET "tier" = \'4 - Raw material processing\' WHERE "type" = 2');
        await queryRunner.query(
            'UPDATE "Facility" SET "tier" = \'3 - Textile or material production\' WHERE "type" = 3'
        );
        await queryRunner.query(
            'UPDATE "Facility" SET "tier" = \'2 - Printing, dyeing and laundering\' WHERE "type" = 6'
        );
    }
}
