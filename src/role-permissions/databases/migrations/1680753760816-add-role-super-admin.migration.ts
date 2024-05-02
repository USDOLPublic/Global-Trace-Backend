import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import roles from '~role-permissions/databases/data/roles-04-06-2023.json';
import { getInsertRoleQueryHelper } from '../helpers/get-insert-role-query.helper';
import format from 'pg-format';
import bcrypt from 'bcrypt';
import { DEFAULT_PASSWORD } from '~users/constants/default-password.constant';
import { env } from '~config/env.config';
import { UserStatusEnum } from '~users/enums/user-status.enum';

export class AddRoleSuperAdmin1680753760816 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(getInsertRoleQueryHelper(roles));

        await this.insertSuperAdmin(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        const roleIds = roles.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "Role" WHERE "id" IN (${roleIds});`);
    }

    private async insertSuperAdmin(queryRunner: QueryRunner) {
        const superAdminEmail = 'superadmin@usdol.com';
        const superAdmin = await this.getUserByEmail(queryRunner, superAdminEmail);
        if (superAdmin) {
            return;
        }

        const insertUserQuery =
            'INSERT INTO "User" (email, password, "firstName", "lastName", "status") VALUES (%L) RETURNING "id"';
        const superAdminData = [
            superAdminEmail,
            bcrypt.hashSync(DEFAULT_PASSWORD, env.SALT_ROUND),
            'Super Admin',
            'USDol',
            UserStatusEnum.ACTIVE
        ];
        const [{ id }] = await queryRunner.query(format(insertUserQuery, superAdminData));

        const insertUserRoleQuery = 'INSERT INTO "UserHasRole" ("userId", "roleId") VALUES (%L)';
        await queryRunner.query(format(insertUserRoleQuery, [id, roles[0].id]));
    }

    private async getUserByEmail(queryRunner: QueryRunner, email: string) {
        return (await queryRunner.query('SELECT "id" FROM "User" WHERE "email" = $1', [email]))[0];
    }
}
