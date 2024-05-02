import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddConstrainUniqueProvinceDistrict1646146220179 extends BaseMigration {
    private constraintName = 'UQ_District_provinceId_districtCode_facilityId';

    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "District" ADD CONSTRAINT ${this.constraintName} UNIQUE ("provinceId", "districtCode")`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "District" DROP CONSTRAINT ${this.constraintName}`);
    }
}
