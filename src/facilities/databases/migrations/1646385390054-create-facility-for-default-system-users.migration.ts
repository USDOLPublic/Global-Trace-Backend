import { BaseMigration } from '@diginexhk/typeorm-helper';
import { QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { FacilityTypeEnum } from '~facilities/enums/facility-type.enum';
import { UserEntity } from '~users/entities/user.entity';
import systemUserFacilities from '../data/system-user-facility.json';

export class CreateFacilityForDefaultSystemUsers1646385390054 extends BaseMigration {
    private farmFacility = {
        id: 'b4e3ddef-3f5c-4c58-a220-fd82d45baae0',
        name: 'Farm Facility',
        type: 1
    };

    async run(queryRunner: QueryRunner) {
        await Promise.all(
            systemUserFacilities.map(({ id, name, type }: { id: string; name: string; type: FacilityTypeEnum }) => {
                const query = `INSERT INTO "Facility" ("id", "name", "type") VALUES ($1, $2, $3)`;
                return queryRunner.query(query, [id, name, type]);
            })
        );
        await this.addFarmFacility(queryRunner);

        return systemUserFacilities.map(async (facility) => {
            const user = await this.getFacilityContact(queryRunner, facility.type);
            const query = `INSERT INTO "FacilityUser" ("id", "userId", "facilityId") VALUES ($1, $2, $3)`;
            return queryRunner.query(query, [uuidv4(), user.id, facility.id]);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await Promise.all(
            systemUserFacilities.map(({ id }: { id: string; name: string; type: FacilityTypeEnum }) =>
                queryRunner.query(`DELETE FROM "Facility" WHERE "id" = $1`, [id])
            )
        );
        await this.removeFarmFacility(queryRunner);

        await Promise.all(
            systemUserFacilities.map(async (facility) => {
                const user = await this.getFacilityContact(queryRunner, facility.type);
                return queryRunner.query(`DELETE FROM "FacilityUser" WHERE "facilityId" = $1 AND "userId" = $2`, [
                    facility.id,
                    user.id
                ]);
            })
        );
    }

    private removeFarmFacility(queryRunner: QueryRunner) {
        return queryRunner.query(`DELETE FROM "Facility" WHERE "id" = $1`, [this.farmFacility.id]);
    }

    private addFarmFacility(queryRunner: QueryRunner) {
        return queryRunner.query(`INSERT INTO "Facility" ("id", "name", "type") VALUES ($1, $2, $3)`, [
            this.farmFacility.id,
            this.farmFacility.name,
            this.farmFacility.type
        ]);
    }

    private async findUserByEmail(queryRunner: QueryRunner, email: string) {
        return (await queryRunner.query(`SELECT * FROM "User" WHERE "email" = '${email}'`))[0];
    }

    private async getFacilityContact(queryRunner: QueryRunner, facilityType: FacilityTypeEnum): Promise<UserEntity> {
        switch (facilityType) {
            case FacilityTypeEnum.GINNER:
                return this.findUserByEmail(queryRunner, 'ginner@usdol.com');
            case FacilityTypeEnum.SPINNER:
                return this.findUserByEmail(queryRunner, 'spinner@usdol.com');
            default:
                return this.findUserByEmail(queryRunner, 'mill@usdol.com');
        }
    }
}
