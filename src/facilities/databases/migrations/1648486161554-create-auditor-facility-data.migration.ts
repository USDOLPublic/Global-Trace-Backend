import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { FacilityTypeEnum } from '~facilities/enums/facility-type.enum';
import { UserEntity } from '~users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

export class CreateAuditorFacilityData1648486161554 extends BaseMigration {
    private auditorFacility = {
        id: '86a36071-a643-4583-ac33-831393261174',
        name: 'Auditor Facility',
        type: FacilityTypeEnum.AUDITOR
    };

    async run(queryRunner: QueryRunner) {
        await this.createFacility(queryRunner);
        await this.createFacilityUser(queryRunner);
    }

    private createFacility(queryRunner: QueryRunner) {
        const { id, name, type } = this.auditorFacility;

        return queryRunner.query(`INSERT INTO "Facility" ("id", "name", "type") VALUES ($1, $2, $3)`, [id, name, type]);
    }

    private async findUserByEmail(queryRunner: QueryRunner, email: string) {
        return (await queryRunner.query(`SELECT * FROM "User" WHERE "email" = '${email}'`))[0];
    }

    private async getAuditorFacilityContact(queryRunner: QueryRunner): Promise<UserEntity> {
        return this.findUserByEmail(queryRunner, 'auditor@usdol.com');
    }

    private async createFacilityUser(queryRunner: QueryRunner) {
        const auditor = await this.getAuditorFacilityContact(queryRunner);
        const query = `INSERT INTO "FacilityUser" ("id", "userId", "facilityId") VALUES ($1, $2, $3)`;

        return queryRunner.query(query, [uuidv4(), auditor.id, this.auditorFacility.id]);
    }

    private removeFacility(queryRunner: QueryRunner) {
        return queryRunner.query(`DELETE FROM "Facility" WHERE "id" = $1`, [this.auditorFacility.id]);
    }

    private async removeFacilityUser(queryRunner: QueryRunner) {
        const user = await this.getAuditorFacilityContact(queryRunner);

        return queryRunner.query(`DELETE FROM "FacilityUser" WHERE "facilityId" = $1 AND "userId" = $2`, [
            this.auditorFacility.id,
            user.id
        ]);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.removeFacility(queryRunner);
        await this.removeFacilityUser(queryRunner);
    }
}
