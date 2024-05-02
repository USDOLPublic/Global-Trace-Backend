import { BaseMigration } from '@diginexhk/typeorm-helper';
import { QueryRunner } from 'typeorm';
import { allSettled } from '~core/helpers/settled.helper';

export class MigrateFacilityForAdminUser1702288750940 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const adminUsers: { userId: string; roleId: string }[] = await this.getAdminUsers(queryRunner);

        await this.createAdminFacilities(queryRunner, adminUsers);
    }

    private async getAdminUsers(queryRunner: QueryRunner) {
        return queryRunner.query(`
            SELECT usr.id "userId", rol.id "roleId"
            FROM "User" usr
            INNER JOIN "Role" rol ON usr."roleId" = rol."id"
            WHERE rol.type = 'Administrator';
        `);
    }

    private async createAdminFacilities(queryRunner: QueryRunner, adminUsers: { userId: string; roleId: string }[]) {
        await allSettled(
            adminUsers.map(async ({ userId, roleId }) => {
                const facilityId: string = (
                    await queryRunner.query(
                        `
                INSERT INTO "Facility" ("typeId") VALUES ($1) RETURNING "id";
            `,
                        [roleId]
                    )
                )[0].id;

                return queryRunner.query(
                    `
                    INSERT INTO "FacilityUser" ("userId", "facilityId")
                    VALUES ($1, $2);
                `,
                    [userId, facilityId]
                );
            })
        );
    }
}
