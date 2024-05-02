import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { SYSTEM_USER } from '~users/constants/system-user.constant';
import bcrypt from 'bcrypt';
import { DEFAULT_PASSWORD } from '~users/constants/default-password.constant';
import { env } from '~config/env.config';
import { randomUUID } from 'crypto';
import { getRoleIdByRoleName } from '~role-permissions/helpers/get-role-id-by-role-name.helper';

export class CreateSystemUserData1645455208400 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        let insertUserQuery = `INSERT INTO "User" (id, email, password, "firstName", "lastName") VALUES `;
        let insertUserRoleQuery = `INSERT INTO "UserHasRole" ("userId", "roleId") VALUES `;
        for (const [index, user] of SYSTEM_USER.entries()) {
            const { email, firstName, lastName, role } = user;
            const userId = randomUUID();
            const password = bcrypt.hashSync(DEFAULT_PASSWORD, env.SALT_ROUND);
            const isLastRecord = index === SYSTEM_USER.length - 1;

            insertUserQuery += `('${userId}', '${email}', '${password}', '${firstName}', '${lastName}')${
                isLastRecord ? ';' : ','
            }`;
            insertUserRoleQuery += `('${userId}', '${getRoleIdByRoleName(role)}')${isLastRecord ? ';' : ','}`;
        }

        await queryRunner.query(insertUserQuery);
        await queryRunner.query(insertUserRoleQuery);
    }

    async rollback(queryRunner: QueryRunner) {
        const userEmails = SYSTEM_USER.map(({ email }) => `'${email}'`);
        await queryRunner.query(`DELETE FROM "User" WHERE "email" IN (${userEmails});`);
    }
}
