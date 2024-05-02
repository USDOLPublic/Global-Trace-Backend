import { SortMultipleParams, SortParams } from '@diginexhk/nestjs-base-decorator';
import { ValidateException } from '@diginexhk/nestjs-exception';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Dictionary, concat, intersectionWith, keyBy, map, omit, uniq } from 'lodash';
import { FindOptionsWhere, In, Not } from 'typeorm';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { CreateRoleDto } from '~role-permissions/http/dto/create-role.dto';
import { UpdateRoleDto } from '~role-permissions/http/dto/update-role.dto';
import { ValidateRoleDto } from '~role-permissions/http/dto/validate-role.dto';
import { GetAndSearchRoleQuery } from '~role-permissions/queries/get-and-search-role.query';
import { GetRoleQuery } from '~role-permissions/queries/get-role.query';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { PermissionService } from '~role-permissions/services/permission.service';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { ListRoleWithTemplateFile } from '~role-permissions/types/list-role-with-template-file.type';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class RoleService extends TransactionService {
    constructor(
        private roleRepo: RoleRepository,
        private permissionRepo: PermissionRepository,
        private rolePermissionService: RolePermissionService,
        @Inject(forwardRef(() => PermissionService)) private permissionService: PermissionService,
        @Inject(forwardRef(() => SupplyChainService)) private supplyChainService: SupplyChainService
    ) {
        super();
    }

    findRoleByName(name: string): Promise<RoleEntity> {
        return this.roleRepo.findByName(name);
    }

    findRoleById(id: string) {
        return this.roleRepo.findById(id);
    }

    findRolesByIds(ids: string[]) {
        return this.roleRepo.find({ where: { id: In(ids) } });
    }

    async canUserLogin(user: UserEntity): Promise<boolean> {
        let role = user.role;

        if (!role) {
            role = await this.roleRepo.findOne({ select: ['type'], where: { id: user.role.id } });
        }

        if (user.roleName === UserRoleEnum.SUPER_ADMIN) {
            return true;
        }

        return this.rolePermissionService.hasPermission(
            user,
            role.type === RoleTypeEnum.ADMINISTRATOR ? PermissionEnum.ONBOARDING : PermissionEnum.COMPLETE_OWN_PROFILE
        );
    }

    async canRoleLogin(role: RoleEntity): Promise<boolean> {
        if (role.name === UserRoleEnum.SUPER_ADMIN) {
            return true;
        }

        return this.rolePermissionService.exists({
            roleId: role.id,
            permission: {
                action:
                    role.type === RoleTypeEnum.ADMINISTRATOR
                        ? PermissionEnum.ONBOARDING
                        : PermissionEnum.COMPLETE_OWN_PROFILE
            }
        });
    }

    async checkUserCanResetPassword(user: UserEntity) {
        const canLogin = await this.canUserLogin(user);
        if (!canLogin) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_reset_password' });
        }
    }

    private mapRoles(permissions: PermissionEntity[]): RoleEntity[] {
        return permissions.reduce((acc, permission) => [...acc, ...permission.roles], []);
    }

    private getValidRoles(permissions: PermissionEntity[]): string[] {
        return uniq(map(this.mapRoles(permissions), 'name'));
    }

    async findRolesByPermissions(permissions: PermissionEntity[]) {
        return this.getValidRoles(permissions);
    }

    async findRolesByPermissionAction(action: string) {
        const permissions = await this.permissionService.findPermissionsByAction(action);
        return this.getValidRoles(permissions);
    }

    async createRole(data: CreateRoleDto) {
        const permissionIds = await this.rolePermissionService.sanitizeAssignedPermission(
            data.type,
            data.chainOfCustody,
            data.assignedPermissionIds
        );
        const newRole = await this.roleRepo.save(omit(data, 'assignedPermissionIds'));

        if (permissionIds.length) {
            await this.rolePermissionService.assignPermissionsToRole(newRole.id, permissionIds);
        }

        return this.roleRepo.findById(newRole.id);
    }

    async updateRole(roleId: string, data: UpdateRoleDto) {
        const permissionIds = await this.rolePermissionService.sanitizeAssignedPermission(
            data.type,
            data.chainOfCustody,
            data.assignedPermissionIds
        );

        const defaultData: Partial<RoleEntity> = {
            chainOfCustody: null,
            seasonStartDate: null,
            seasonDuration: null
        };
        await this.roleRepo.update(roleId, Object.assign(defaultData, omit(data, 'assignedPermissionIds')));

        if (permissionIds.length) {
            await this.rolePermissionService.updateRoleHasPermission(roleId, permissionIds);
        }
    }

    private createRoleResponse(role: RoleEntity) {
        const { permissions } = role;

        return {
            ...role,
            permissions: permissions
                .filter((permission) => !permission.parentId)
                .map((permission) => {
                    const subPermissions = permissions.filter(({ parentId }) => parentId);

                    return {
                        ...permission,
                        subPermissions: intersectionWith(
                            subPermissions,
                            subPermissions.map((x) => permission.id),
                            (subPermission, parentId) => subPermission.parentId === parentId
                        )
                    };
                })
        };
    }

    async getAllRoles(
        user: UserEntity,
        sortParams: SortMultipleParams[],
        canInvite: boolean,
        type: RoleTypeEnum,
        key?: string
    ) {
        let excludedRoleIds: string[] = [];
        if (canInvite) {
            excludedRoleIds = await this.getExcludedRoles(user);
        }
        const foundRoles = await this.roleRepo.find(
            new GetAndSearchRoleQuery({ type, key, sortParams, excludedRoleIds })
        );
        const permissionCount = await this.permissionRepo.countPermissionsByGroup();

        return foundRoles.map((role) => ({
            ...this.createRoleResponse(role),
            numOfPermissions: role.permissions.length,
            totalPermissions: permissionCount.find((item) => item.group === role.type)?.totalPermissions || 0
        }));
    }

    async getRole(id: string) {
        const [role] = await this.roleRepo.find(new GetRoleQuery({ id }));

        if (!role) return null;

        return this.createRoleResponse(role);
    }

    async deleteRole(id: string) {
        await this.supplyChainService.deleteByOption({ where: { roleId: id } });
        return this.roleRepo.softDelete(id);
    }

    async validateRole(data: ValidateRoleDto) {
        const { id, name } = data;
        const foundRole = await this.roleRepo.findOne({ where: { name } });

        if (foundRole && foundRole.id !== id) {
            throw new ValidateException([
                {
                    property: 'name',
                    constraints: {
                        invalidField: {
                            message: 'existed_role_name',
                            detail: {}
                        } as any
                    }
                }
            ]);
        }
    }

    async getRolesDoesNotHavePermission(
        action: string,
        conditions?: FindOptionsWhere<RoleEntity>
    ): Promise<RoleEntity[]> {
        return this.roleRepo.getRolesDoesNotHavePermission(action, conditions);
    }

    getSelfAssessmentFileOfRoles(
        roles: RoleEntity[],
        key: string,
        sort: SortParams
    ): Promise<ListRoleWithTemplateFile[]> {
        const roleIds = roles.map(({ id }) => id);
        return this.roleRepo.getSelfAssessmentFileOfRoles(roleIds, key, sort);
    }

    async getRolesHavePermission(action: string, roleIds: string[]): Promise<RoleEntity[]> {
        return this.roleRepo.getRolesHavePermission(action, roleIds);
    }

    async checkRoleHasPermission(action: string, roleId: string): Promise<boolean> {
        return this.roleRepo.checkRoleHasPermission(action, roleId);
    }

    async getSupplierRoles(canInviteOnly: boolean = false): Promise<RoleEntity[]> {
        const roleIds = await this.getSupplierRoleIds();

        if (canInviteOnly) {
            return this.getRolesHavePermission(PermissionEnum.COMPLETE_OWN_PROFILE, roleIds);
        }
        return this.findRolesByIds(roleIds);
    }

    async getSupplierRoleIds(): Promise<string[]> {
        const supplyChainNodes = await this.supplyChainService.find({});
        return supplyChainNodes.map(({ roleId }) => roleId);
    }

    async getSupplierRoleNames(): Promise<string[]> {
        const roles = await this.getSupplierRoles(true);
        return roles.map(({ name }) => name);
    }

    async getRolesAndMapByNames(names: string[]): Promise<Dictionary<RoleEntity>> {
        const roles = await this.roleRepo.find({ select: ['id', 'name'], where: { name: In(names) } });
        return keyBy(roles, 'name');
    }

    getRolesHasPermissionCompletesProfile(): Promise<RoleEntity[]> {
        return this.roleRepo.getRolesHasPermissionCompletesProfile();
    }

    getProductRolesHasPermission(): Promise<RoleEntity[]> {
        return this.roleRepo.getProductRolesHasPermission();
    }

    async getExcludedRoles(user: UserEntity): Promise<string[]> {
        const { role } = user;
        const isNotSuperAdmin = role.name !== UserRoleEnum.SUPER_ADMIN;
        const [excludeAdminRoles, excludeOtherRoles] = await Promise.all([
            this.getRolesDoesNotHavePermission(PermissionEnum.ONBOARDING, {
                type: RoleTypeEnum.ADMINISTRATOR
            }),
            this.getRolesDoesNotHavePermission(PermissionEnum.COMPLETE_OWN_PROFILE, {
                type: Not(RoleTypeEnum.ADMINISTRATOR)
            })
        ]);
        const excludedRoles = concat(excludeAdminRoles, excludeOtherRoles);
        const roleIds = excludedRoles.map((excludedRole) => excludedRole.id);

        if (isNotSuperAdmin) {
            const superAdminRole = await this.findRoleByName(UserRoleEnum.SUPER_ADMIN);
            roleIds.push(superAdminRole.id);
        }

        return roleIds;
    }
}
