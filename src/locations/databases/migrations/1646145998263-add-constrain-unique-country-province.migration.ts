import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddConstrainUniqueCountryProvinceCode1646145998263 extends BaseMigration {
    private constraintName = 'UQ_Province_countryId_provinceCode_facilityId';

    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "Province" ADD CONSTRAINT ${this.constraintName} UNIQUE ("countryId", "provinceCode")`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "Province" DROP CONSTRAINT ${this.constraintName}`);
    }
}
