import { ValidateException, ValidationError } from '@diginexhk/nestjs-exception';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { isEmpty, isNil, uniq, uniqBy } from 'lodash';
import { FindOneOptions, FindOptionsWhere, In } from 'typeorm';
import { createValidationError } from '~core/helpers/create-validation-error.helper';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleHasPermissionEntity } from '~role-permissions/entities/role-has-permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { GroupTypeEnum } from '~role-permissions/enums/group-type.enum';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { RoleHasPermissionRepository } from '~role-permissions/repositories/role-has-permission.repository';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class RolePermissionService {
    constructor(
        private roleRepo: RoleRepository,
        private permissionRepo: PermissionRepository,
        private rolePermissionRepo: RoleHasPermissionRepository
    ) {}

    hasAnyRoles(user: UserEntity, roles: Array<string | RoleEntity>): boolean {
        return !!roles.find((role) => {
            if (role instanceof RoleEntity) {
                return role?.name === user.roleName;
            }
            return role === user.roleName;
        });
    }

    async loadRoles(user: UserEntity): Promise<void> {
        if (isNil(user?.role)) {
            user.role = await this.roleRepo.findById(user.roleId, { relations: ['permissions'] });
        }
    }

    async checkHasAnyPermissionsOrFail(user: UserEntity, permissions: string[] | PermissionEntity[]): Promise<void> {
        const isValid = await this.hasAnyPermissions(user, permissions);
        if (!isValid) {
            throw new ForbiddenException({ translate: 'error.forbidden' });
        }
    }

    async hasAnyPermissions(user: UserEntity, permissions: string[] | PermissionEntity[]): Promise<boolean> {
        for (const permission of permissions) {
            if (await this.hasPermission(user, permission)) {
                return true;
            }
        }
        return false;
    }

    async hasAllPermissions(user: UserEntity, permissions: string[] | PermissionEntity[]): Promise<boolean> {
        for (const permission of permissions) {
            if (!(await this.hasPermission(user, permission))) {
                return false;
            }
        }
        return true;
    }

    async hasPermission(user: UserEntity, permission: string | PermissionEntity): Promise<boolean> {
        const [hasPermission, hasDirectPermission] = await Promise.all([
            this.hasPermissionViaRole(user, permission),
            this.hasDirectPermission(user, permission)
        ]);

        return hasPermission || hasDirectPermission;
    }

    async hasDirectPermission(user: UserEntity, permission: string | PermissionEntity): Promise<boolean> {
        await this.loadPermissions(user);

        return user.permissions.some(({ action }) => {
            return this.isSamePermission(action, permission);
        });
    }

    async hasPermissionViaRole(user: UserEntity, permission: string | PermissionEntity): Promise<boolean> {
        await this.loadRoles(user);

        return user.role.permissions.some(({ action }) => {
            return this.isSamePermission(action, permission);
        });
    }

    private isSamePermission(action: string, permission: string | PermissionEntity): boolean {
        if (permission instanceof PermissionEntity) {
            return permission.action === action;
        }

        return permission === action;
    }

    private async loadPermissions(user: UserEntity): Promise<void> {
        if (isNil(user.permissions)) {
            user.permissions = await this.permissionRepo.getPermissionsOfUser(user);
        }
    }

    async assignPermissionsToRole(roleId: string, assignedPermissionIds: string[]): Promise<void> {
        await this.rolePermissionRepo.save(
            assignedPermissionIds.map((permissionId) => ({
                roleId,
                permissionId
            }))
        );
    }

    async updateRoleHasPermission(roleId: string, assignedPermissionIds: string[]): Promise<void> {
        if (!assignedPermissionIds.length) {
            await this.rolePermissionRepo.delete({ roleId });
            return;
        }

        await this.rolePermissionRepo.deleteUnusedPermissions(roleId, assignedPermissionIds);

        await this.rolePermissionRepo.upsert(
            assignedPermissionIds.map((permissionId) => ({
                roleId,
                permissionId
            })),
            {
                conflictPaths: ['roleId', 'permissionId']
            }
        );
    }

    async sanitizeAssignedPermission(
        type: RoleTypeEnum,
        chainOfCustody?: ChainOfCustodyEnum,
        permissionIds?: string[]
    ): Promise<string[]> {
        if (!permissionIds?.length) return [];

        const uniqPermissionIds = uniq(permissionIds);
        const foundPermissions = await this.permissionRepo.findByIds(uniqPermissionIds);

        this.validateAssignedPermissionType(type, foundPermissions);
        this.validateAssignedSubPermission(foundPermissions);
        this.validateSingleAssignedSubPermission(foundPermissions);
        this.validateSubPermissionMarginOfError(foundPermissions, type, chainOfCustody);

        return uniqPermissionIds;
    }

    private validateAssignedPermissionType(type: RoleTypeEnum, permissions: PermissionEntity[]) {
        const errors: ValidationError[] = [];

        permissions.forEach((permission, index) => {
            if (!permission.groups.includes(type)) {
                errors.push(
                    createValidationError({
                        property: `assignedPermissionIds[${index}]`,
                        message: 'invalid_type_of_assigned_permission'
                    })
                );
            }
        });

        if (errors.length) throw new ValidateException(errors);
    }

    private validateAssignedSubPermission(permissions: PermissionEntity[]) {
        const errors: ValidationError[] = [];

        permissions
            .filter(({ parentId }) => parentId !== null)
            .forEach((subPermission, index) => {
                const parentPermission = permissions.find((permission) => permission.id === subPermission.parentId);

                if (!parentPermission) {
                    errors.push(
                        createValidationError({
                            property: `assignedPermissionIds[${index}]`,
                            message: 'improperly_assigned_sub_permission'
                        })
                    );
                }
            });

        if (errors.length) throw new ValidateException(errors);
    }

    private validateSingleAssignedSubPermission(permissions: PermissionEntity[]) {
        const errors: ValidationError[] = [];

        permissions
            .filter(
                ({ parentId, groupType }) =>
                    !parentId && [GroupTypeEnum.RADIO_GROUP, GroupTypeEnum.RADIO_MULTIPLE_GROUP].includes(groupType)
            )
            .forEach((permission, index) => {
                const subPermissions = permissions.filter((subPermission) => subPermission.parentId === permission.id);

                if (uniqBy(subPermissions, 'label').length !== subPermissions.length) {
                    errors.push(
                        createValidationError({
                            property: `assignedPermissionIds[${index}]`,
                            message: 'invalid_assigned_single_sub_permission'
                        })
                    );
                }
            });

        if (errors.length) throw new ValidateException(errors);
    }

    private validateSubPermissionMarginOfError(
        permissions: PermissionEntity[],
        type: RoleTypeEnum,
        chainOfCustody?: ChainOfCustodyEnum
    ) {
        const errors: ValidationError[] = [];
        if (type !== RoleTypeEnum.PRODUCT || chainOfCustody !== ChainOfCustodyEnum.PRODUCT_SEGREGATION) {
            return;
        }

        permissions
            .filter(({ action }) => action === PermissionEnum.VIEW_MARGIN_OF_ERROR)
            .forEach((permission, index) => {
                errors.push(
                    createValidationError({
                        property: `assignedPermissionIds[${index}]`,
                        message: 'view_margin_of_error_is_not_allowed'
                    })
                );
            });

        if (errors.length) throw new ValidateException(errors);
    }

    async findRoleIdsHasPermissionByAction(action: PermissionEnum): Promise<string[]> {
        const roleHasPermission = await this.rolePermissionRepo.findRoleHasPermissionByAction(action);
        return roleHasPermission.map(({ roleId }) => roleId);
    }

    async findOne(options: FindOneOptions<RoleHasPermissionEntity>) {
        return this.rolePermissionRepo.findOne(options);
    }

    async existsRoleHasPermission(actions: PermissionEnum[]): Promise<boolean> {
        return this.rolePermissionRepo.existsRoleHasPermission(actions);
    }

    exists(conditions: FindOptionsWhere<RoleHasPermissionEntity>): Promise<boolean> {
        return this.rolePermissionRepo.exists(conditions);
    }

    async findRolesByPermission(action: PermissionEnum, types: RoleTypeEnum[] = []): Promise<RoleEntity[]> {
        const roleIds = await this.findRoleIdsHasPermissionByAction(action);
        const filter: FindOptionsWhere<RoleEntity> = { id: In(roleIds) };

        if (!isEmpty(types)) {
            filter.type = In(types);
        }

        return this.roleRepo.findBy(filter);
    }
}
