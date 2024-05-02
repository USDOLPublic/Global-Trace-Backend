import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateProvinceTable1653359341154 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`DELETE FROM "Province" WHERE "provinceCode" = 'l' AND "province" = 'Maputo'`);
    }
}
