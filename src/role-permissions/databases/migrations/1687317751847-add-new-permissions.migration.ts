import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import newPermissions from '~role-permissions/databases/data/permissions-06-21-2023.json';

export class AddNewPermissions1687317751847 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.addNewPermissions(queryRunner);
    }

    private async addNewPermissions(queryRunner: QueryRunner): Promise<void> {
        for (const newPermission of newPermissions) {
            const permission = await this.getPermissionByAction(queryRunner, newPermission.action);
            if (permission) {
                continue;
            }

            await this.addNewPermission(queryRunner, newPermission);
        }
    }

    private async getPermissionByAction(queryRunner: QueryRunner, action: string): Promise<{ id: string }> {
        return (await queryRunner.query('SELECT "id" FROM "Permission" WHERE "action" = $1', [action]))[0];
    }

    private async addNewPermission(
        queryRunner: QueryRunner,
        permission: { [key: string]: string | number }
    ): Promise<void> {
        await queryRunner.query(
            'INSERT INTO "Permission" ("id", "name", "action", "set", "setName", "groupId") VALUES ($1, $2, $3, $4, $5, $6)',
            [permission.id, permission.name, permission.action, permission.set, permission.setName, permission.groupId]
        );
    }
}
