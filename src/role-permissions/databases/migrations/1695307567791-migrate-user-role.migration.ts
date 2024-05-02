import { BaseMigration } from '@diginexhk/typeorm-helper';
import { QueryRunner } from 'typeorm';

export class MigrateUserRole1695307567791 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.migrateUserRole(queryRunner);
        await queryRunner.dropTable('UserHasRole');
    }

    private async migrateUserRole(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "User" AS u
            SET "roleId" = uhr."roleId"
            FROM "UserHasRole" AS uhr
            WHERE u."id" = uhr."userId";
        `);
    }

    async rollback(queryRunner: QueryRunner) {
        const userRoleConstraint = 'UQ_UserHasRole_userId_roleId';

        await this.create('UserHasRole', (table) => {
            table.primaryUuid('id');
            table.uuid('userId').index().foreign('User');
            table.uuid('roleId').index().foreign('Role');
            table.baseTime();
        });
        await queryRunner.query(`
            ALTER TABLE "UserHasRole" ADD CONSTRAINT ${userRoleConstraint} UNIQUE ("userId", "roleId");
        `);
        await queryRunner.query('INSERT INTO "UserHasRole" ("userId", "roleId") SELECT "id", "roleId" FROM "User"');
    }
}
