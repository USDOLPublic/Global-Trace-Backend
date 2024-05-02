import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddConstraintUniqueToRolePermissionsTables1645143674674 extends BaseMigration {
    private rolePermissionConstraint = 'UQ_RoleHasPermission_roleId_permissionId';
    private userRoleConstraint = 'UQ_UserHasRole_userId_roleId';
    private userPermissionConstraint = 'UQ_UserHasPermission_userId_permissionId';

    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "RoleHasPermission" ADD CONSTRAINT ${this.rolePermissionConstraint} UNIQUE ("roleId", "permissionId");
            ALTER TABLE "UserHasRole" ADD CONSTRAINT ${this.userRoleConstraint} UNIQUE ("userId", "roleId");
            ALTER TABLE "UserHasPermission" ADD CONSTRAINT ${this.userPermissionConstraint} UNIQUE ("userId", "permissionId");`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "RoleHasPermission" DROP CONSTRAINT ${this.rolePermissionConstraint};
            ALTER TABLE "UserHasRole" DROP CONSTRAINT ${this.userRoleConstraint};
            ALTER TABLE "UserHasPermission" DROP CONSTRAINT ${this.userPermissionConstraint};`
        );
    }
}
