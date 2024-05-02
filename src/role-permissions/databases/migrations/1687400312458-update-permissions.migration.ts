import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import roleHasPermissions from '~role-permissions/databases/data/role-permissions-06-21-2023-v1.json';
import format from 'pg-format';

export class UpdatePermissions1687400312458 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const allPermissions = await this.getAllPermissions(queryRunner);
        const mapPermission = Object.fromEntries(allPermissions.map(({ id, action }) => [action, id]));

        for (const role of Object.values(roleHasPermissions)) {
            const { name, permissions: newActions } = role;
            const { id: roleId } = await this.getRoleByName(queryRunner, name);
            const oldActions = await this.getPermissionActions(queryRunner, roleId);

            const addActions = newActions.filter((action) => !oldActions.includes(action));
            if (addActions.length) {
                const addData = addActions.map((action) => [roleId, mapPermission[action]]);
                await this.insertRoleHasPermissions(queryRunner, addData);
            }

            const deleteActions = oldActions.filter((action) => !newActions.includes(action));
            if (deleteActions.length) {
                const deletePermissionIds = deleteActions.map((action) => mapPermission[action]);
                await this.deleteRoleHasPermissions(queryRunner, roleId, deletePermissionIds);
            }
        }
    }

    private async deleteRoleHasPermissions(
        queryRunner: QueryRunner,
        roleId: string,
        permissionIds: string[]
    ): Promise<void> {
        const sql = format(
            'DELETE FROM "RoleHasPermission" WHERE "roleId" = %L AND "permissionId" IN (%L)',
            roleId,
            permissionIds
        );
        await queryRunner.query(sql);
    }

    private async insertRoleHasPermissions(queryRunner: QueryRunner, data): Promise<void> {
        const sql = format('INSERT INTO "RoleHasPermission" ("roleId", "permissionId") VALUES %L', data);
        await queryRunner.query(sql);
    }

    private async getRoleByName(queryRunner: QueryRunner, name: string): Promise<{ id: string }> {
        return (await queryRunner.query('SELECT "id" FROM "Role" WHERE "name" = $1', [name]))[0];
    }

    private async getPermissionActions(queryRunner: QueryRunner, roleId: string): Promise<string[]> {
        const permissions = await queryRunner.query(
            'SELECT "P"."id", "P"."action" FROM "Permission" "P" JOIN "RoleHasPermission" "RHP" ON "RHP"."permissionId" = "P"."id" WHERE "RHP"."roleId" = $1',
            [roleId]
        );
        return permissions.map(({ action }) => action);
    }

    private getAllPermissions(queryRunner: QueryRunner) {
        return queryRunner.query('SELECT "id", "action" FROM "Permission"');
    }
}
