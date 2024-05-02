import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { v4 as uuidv4 } from 'uuid';

export class AddColumnAdditionalRoleToFacilityTable1686799193897 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.integer('additionalRole').nullable();
        });

        const roleFarm = await this.getRoleFarm(queryRunner);

        await queryRunner.query(
            `UPDATE "Facility"
            SET "additionalRole" = $1, "typeId" = $2
            FROM "Role"
            WHERE "Role"."id" = "Facility"."typeId" AND "Role"."name" = $3;`,
            [AdditionalRoleEnum.FARM_GROUP, roleFarm.id, UserRoleEnum.FARM_GROUP]
        );

        await queryRunner.query(
            `UPDATE "FacilityPartner"
            SET "typeId" = $1
            FROM "Role"
            WHERE "Role"."id" = "FacilityPartner"."typeId" AND "Role"."name" = $2;`,
            [roleFarm.id, UserRoleEnum.FARM_GROUP]
        );

        await queryRunner.query(
            `UPDATE "SelfAssessmentGroup"
            SET "forRole" = $1
            WHERE "forRole" = $2;`,
            [UserRoleEnum.FARM, UserRoleEnum.FARM_GROUP]
        );

        await queryRunner.query('DELETE FROM "Role" WHERE "name" = $1;', [UserRoleEnum.FARM_GROUP]);
    }

    private async getRoleFarm(queryRunner: QueryRunner) {
        return (await queryRunner.query('SELECT "id" FROM "Role" WHERE "name" = $1', [UserRoleEnum.FARM]))[0];
    }

    async rollback(queryRunner: QueryRunner) {
        const farmGroupId = uuidv4();
        const roleFarm = await this.getRoleFarm(queryRunner);

        await queryRunner.query('INSERT FROM "Role" ("id", "name") VALUES ($1, $2);', [
            farmGroupId,
            UserRoleEnum.FARM_GROUP
        ]);

        await queryRunner.query(
            `UPDATE "SelfAssessmentGroup"
            SET "forRole" = $1
            WHERE "forRole" = $2;`,
            [UserRoleEnum.FARM_GROUP, UserRoleEnum.FARM]
        );

        await queryRunner.query(
            `UPDATE "FacilityPartner"
            SET "typeId" = $1
            FROM "Facility"
            WHERE "Facility"."id" = "FacilityPartner"."partnerId" AND "Facility"."typeId" = $2 AND "Facility"."additionalRole" = $3;`,
            [farmGroupId, roleFarm.id, AdditionalRoleEnum.FARM_GROUP]
        );

        await queryRunner.query(
            `UPDATE "Facility"
            SET "typeId" = $1
            WHERE "typeId" = $2 AND "additionalRole" = $3;`,
            [farmGroupId, roleFarm.id, AdditionalRoleEnum.FARM_GROUP]
        );

        await this.update('Facility', (table) => {
            table.dropColumn('additionalRole');
        });
    }
}
