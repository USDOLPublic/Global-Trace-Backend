import { SortParams } from '@diginexhk/nestjs-base-decorator';
import { CustomRepository } from '@diginexhk/typeorm-helper';
import { FindOneOptions, FindOptionsWhere, ILike, In } from 'typeorm';
import { convertStringToSearch } from '~core/helpers/string.helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { ListRoleWithTemplateFile } from '~role-permissions/types/list-role-with-template-file.type';
import { SelfAssessmentUploadFileTypeEnum } from '~self-assessments/enums/self-assessment-upload-file-type.enum';
import { TemplateFileStatusEnum } from '~self-assessments/enums/template-file-status.enum';

@CustomRepository(RoleEntity)
export class RoleRepository extends BaseRepository<RoleEntity> {
    findByName(name: string, options?: FindOneOptions<RoleEntity>) {
        return this.findOneOrFail({
            where: { name },
            ...options,
            relations: options?.relations || ['permissions']
        });
    }

    findById(id: string, options?: FindOneOptions<RoleEntity>) {
        return this.findOneOrFail({
            where: { id },
            ...options,
            relations: options?.relations || ['permissions']
        });
    }

    getRolesDoesNotHavePermission(action: string, conditions?: FindOptionsWhere<RoleEntity>): Promise<RoleEntity[]> {
        const queryBuilder = this.createQueryBuilder('role').where((qb) => {
            const subQuery = qb
                .subQuery()
                .select('1')
                .from('RoleHasPermission', 'roleHasPermission')
                .innerJoin('roleHasPermission.permission', 'permission')
                .where('permission.action = :action', { action })
                .andWhere('roleHasPermission.roleId = role.id')
                .getQuery();
            return `NOT EXISTS(${subQuery})`;
        });

        if (conditions) {
            queryBuilder.andWhere(conditions);
        }

        return queryBuilder.getMany();
    }

    getRolesHavePermission(action: string, roleIds: string[]): Promise<RoleEntity[]> {
        return this.createQueryBuilder('role')
            .innerJoin('role.permissions', 'permission')
            .where('permission.action = :action', { action })
            .andWhere('role.id In (:...roleIds)', { roleIds })
            .getMany();
    }

    checkRoleHasPermission(action: string, roleId: string): Promise<boolean> {
        return this.createQueryBuilder('role')
            .innerJoin('role.permissions', 'permission')
            .where('permission.action = :action', { action })
            .andWhere('role.id = :roleId', { roleId })
            .getExists();
    }

    // eslint-disable-next-line max-lines-per-function
    getSelfAssessmentFileOfRoles(
        roleIds: string[],
        key: string,
        { sortField, sortDirection }: SortParams
    ): Promise<ListRoleWithTemplateFile[]> {
        const query = this.createQueryBuilder('Role')
            .leftJoin(
                'Role.selfAssessmentUploadFiles',
                'selfAssessmentSaqUploadFile',
                'selfAssessmentSaqUploadFile.type = :uploadFileSaqType',
                { uploadFileSaqType: SelfAssessmentUploadFileTypeEnum.SAQ }
            )
            .leftJoin(
                'Role.selfAssessmentUploadFiles',
                'selfAssessmentFacilityGroupTemplateUploadFile',
                'selfAssessmentFacilityGroupTemplateUploadFile.type = :uploadFileFacilityGroupTemplateType',
                { uploadFileFacilityGroupTemplateType: SelfAssessmentUploadFileTypeEnum.FACILITY_GROUP_TEMPLATE }
            )
            .leftJoin('Role.selfAssessmentTranslationFile', 'selfAssessmentTranslationFile')
            .leftJoin(
                (qb) =>
                    qb
                        .select('permission.action', 'action')
                        .addSelect('"roleHasPermission"."roleId"', 'roleId')
                        .from('Permission', 'permission')
                        .innerJoin(
                            'RoleHasPermission',
                            'roleHasPermission',
                            '"roleHasPermission"."permissionId" = permission.id'
                        )
                        .where('permission.action = :action', {
                            action: PermissionEnum.ADMINISTRATOR_COMPLETES_PROFILE
                        }),
                'permission',
                'permission."roleId" = "Role".id'
            )
            .select('Role.id', 'id')
            .addSelect('Role.name', 'name')
            .addSelect('Role.createdAt', 'createdAt')
            .addSelect('CASE WHEN permission.action IS NOT NULL THEN true ELSE false END', 'hasFacilityGroupTemplate')
            .addSelect(
                `CASE WHEN selfAssessmentSaqUploadFile.file IS NOT NULL THEN '${TemplateFileStatusEnum.UPLOADED}' ELSE '${TemplateFileStatusEnum.WAITING_FOR_SUBMISSION}' END`,
                'saqStatus'
            )
            .addSelect(
                `CASE WHEN selfAssessmentTranslationFile.file IS NOT NULL THEN '${TemplateFileStatusEnum.UPLOADED}' ELSE '${TemplateFileStatusEnum.WAITING_FOR_SUBMISSION}' END`,
                'saqTranslationStatus'
            )
            .addSelect('selfAssessmentSaqUploadFile.file', 'fileSaq')
            .addSelect('selfAssessmentFacilityGroupTemplateUploadFile.file', 'fileFacilityGroupTemplate')
            .addSelect('selfAssessmentTranslationFile.file', 'fileSaqTranslation')
            .where({ id: In(roleIds) });

        if (key) {
            query.andWhere({ name: ILike(`%${convertStringToSearch(key)}%`) });
        }

        return query.orderBy(`"${sortField}"`, `${sortDirection}`).getRawMany();
    }

    getRolesHasPermissionCompletesProfile(): Promise<RoleEntity[]> {
        return this.createQueryBuilder('role')
            .innerJoin('role.permissions', 'permission')
            .where('permission.action = :action', { action: PermissionEnum.ADMINISTRATOR_COMPLETES_PROFILE })
            .getMany();
    }

    getProductRolesHasPermission(): Promise<RoleEntity[]> {
        return this.createQueryBuilder('role')
            .innerJoin('role.permissions', 'permission')
            .where({ type: In([RoleTypeEnum.PRODUCT, RoleTypeEnum.LABOR, RoleTypeEnum.BRAND]) })
            .andWhere('permission.action In (:...actions)', {
                actions: [PermissionEnum.COMPLETE_OWN_SAQ, PermissionEnum.ADMINISTRATOR_COMPLETES_SAQ]
            })
            .getMany();
    }
}
