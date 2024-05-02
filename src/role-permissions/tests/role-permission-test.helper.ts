import faker from 'faker';
import { BaseEntity } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TestHelper } from '~core/tests/test.helper';
import permissions from '~role-permissions/databases/data/permissions.json';
import roles from '~role-permissions/databases/data/roles.json';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { getRoleIdByRoleName } from '~role-permissions/helpers/get-role-id-by-role-name.helper';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { RoleHasPermissionRepository } from '~role-permissions/repositories/role-has-permission.repository';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { DEVELOPER_USER } from '~users/constants/developer-user.constant';
import { SYSTEM_USER } from '~users/constants/system-user.constant';
import { UserRepository } from '~users/repositories/user.repository';

export class RolePermissionTestHelper {
    constructor(private testHelper: TestHelper) {}

    seedingRole() {
        return Promise.all(
            roles.map(({ id, name }) => RoleRepository.make().save({ id: id, name: name as UserRoleEnum }))
        );
    }

    seedingPermission() {
        return Promise.all(
            permissions.map(({ id, name, action }) => PermissionRepository.make().save({ id, name, action }))
        );
    }

    private isExistUser(email: string) {
        return UserRepository.make().findOneBy({ email });
    }

    async seedingUser() {
        const seedingUsers = SYSTEM_USER;
        if (process.env.APP_ENV !== 'production') {
            seedingUsers.push(...DEVELOPER_USER);
        }

        for (const { email, firstName, lastName, role } of seedingUsers) {
            if (!(await this.isExistUser(email))) {
                const roleId = getRoleIdByRoleName(role);

                await UserRepository.make().save({ email, firstName, lastName, roleId });
            }
        }
    }

    seedingRolePermission() {
        return Promise.all([this.seedingRole(), this.seedingPermission(), this.seedingUser()]);
    }

    async createRole(options: QueryDeepPartialEntity<RoleEntity> = {}, assignedPermissionIds?: string[]) {
        const role = await RoleRepository.make().createOne({
            name: faker.name.jobTitle(),
            type: RoleTypeEnum.PRODUCT,
            isRawMaterialExtractor: false,
            chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
            ...options
        });

        if (assignedPermissionIds && assignedPermissionIds.length) {
            await RoleHasPermissionRepository.make().save(
                assignedPermissionIds.map((permissionId) => ({
                    roleId: role.id,
                    permissionId
                }))
            );
        }

        return role;
    }

    async assignPermissions(roleId: string, assignedPermissionIds?: string[]) {
        await RoleHasPermissionRepository.make().save(
            assignedPermissionIds.map((permissionId) => ({
                roleId,
                permissionId
            }))
        );
    }

    async createPermission(options: QueryDeepPartialEntity<PermissionEntity> = {}) {
        return PermissionRepository.make().createOne({
            name: faker.name.jobTitle(),
            action: 'OTHERS',
            sortOrder: 1,
            ...options
        });
    }

    async visibleInDatabase(entity: typeof BaseEntity, condition) {
        if (typeof condition === 'string') {
            condition = { id: condition };
        }
        if (!(await entity.getRepository().findOneBy(condition))) {
            throw new Error(`${JSON.stringify(condition)} invisible in database`);
        }
    }
}
