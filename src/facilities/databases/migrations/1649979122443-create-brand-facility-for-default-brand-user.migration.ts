import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { FacilityTypeEnum } from '~facilities/enums/facility-type.enum';
import { UserEntity } from '~users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

export class CreateBrandFacilityForDefaultBrandUser1649979122443 extends BaseMigration {
    private brandFacility = {
        id: '36631e8d-797e-4dbe-ace5-9ff424b04dee',
        name: 'Brand Facility',
        type: FacilityTypeEnum.BRAND
    };

    async run(queryRunner: QueryRunner) {
        await this.createFacility(queryRunner);
        await this.createFacilityUser(queryRunner);
    }

    private createFacility(queryRunner: QueryRunner) {
        const { id, name, type } = this.brandFacility;

        return queryRunner.query(`INSERT INTO "Facility" ("id", "name", "type") VALUES ($1, $2, $3)`, [id, name, type]);
    }

    private async findUserByEmail(queryRunner: QueryRunner, email: string) {
        return (await queryRunner.query(`SELECT * FROM "User" WHERE "email" = '${email}'`))[0];
    }

    private getBrandFacilityContact(queryRunner: QueryRunner): Promise<UserEntity> {
        return this.findUserByEmail(queryRunner, 'brand@usdol.com');
    }

    private async createFacilityUser(queryRunner: QueryRunner) {
        const brander = await this.getBrandFacilityContact(queryRunner);
        const query = `INSERT INTO "FacilityUser" ("id", "userId", "facilityId") VALUES ($1, $2, $3)`;

        return queryRunner.query(query, [uuidv4(), brander.id, this.brandFacility.id]);
    }

    private removeFacility(queryRunner: QueryRunner) {
        return queryRunner.query(`DELETE FROM "Facility" WHERE "id" = $1`, [this.brandFacility.id]);
    }

    private async removeFacilityUser(queryRunner: QueryRunner) {
        const user = await this.getBrandFacilityContact(queryRunner);

        return queryRunner.query(`DELETE FROM "FacilityUser" WHERE "facilityId" = $1 AND "userId" = $2`, [
            this.brandFacility.id,
            user.id
        ]);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.removeFacility(queryRunner);
        await this.removeFacilityUser(queryRunner);
    }
}
