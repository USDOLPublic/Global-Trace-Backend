import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import roles from '~role-permissions/databases/data/roles.json';

export class CreateRoleData1645453870551 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        let query = `INSERT INTO "Role" (id, name) VALUES `;
        for (const [index, role] of roles.entries()) {
            const { id, name } = role;
            const isLastRecord = index === roles.length - 1;
            query += `('${id}', '${name}')${isLastRecord ? ';' : ','}`;
        }
        await queryRunner.query(query);
    }

    async rollback(queryRunner: QueryRunner) {
        const roleIds = roles.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "Role" WHERE "id" IN (${roleIds});`);
    }
}
