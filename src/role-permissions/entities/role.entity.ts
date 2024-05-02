import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { DateTransformer } from '~core/transformers/date.transformer';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleHasPermissionEntity } from '~role-permissions/entities/role-has-permission.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { SelfAssessmentTranslationFileEntity } from '~self-assessments/entities/self-assessment-translation-file.entity';
import { SelfAssessmentUploadFileEntity } from '~self-assessments/entities/self-assessment-upload-file.entity';
import { UserEntity } from '~users/entities/user.entity';

@Entity('Role')
export class RoleEntity extends BaseEntity {
    @Column({ type: 'character varying' })
    name: string;

    @Column({ nullable: true })
    type: RoleTypeEnum | null;

    @Column({ nullable: true })
    chainOfCustody: ChainOfCustodyEnum | null;

    @Column({ type: 'boolean', default: false })
    isHidden: boolean;

    @Column({ type: 'boolean', nullable: true })
    isRawMaterialExtractor: boolean;

    @Column({ type: 'date', transformer: new DateTransformer(), nullable: true })
    seasonStartDate: Date | null;

    @Column({ nullable: true })
    seasonDuration: number;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @OneToMany(() => RoleHasPermissionEntity, (roleHasPermission) => roleHasPermission.role)
    hasPermissions!: RoleHasPermissionEntity[];

    @OneToMany(() => UserEntity, (user) => user.role)
    users: UserEntity[];

    @ManyToMany(() => PermissionEntity, (permissions) => permissions.roles)
    @JoinTable({ name: 'RoleHasPermission' })
    permissions: PermissionEntity[];

    @OneToMany(() => FacilityEntity, (facility) => facility.type)
    facilities: FacilityEntity[];

    @OneToMany(() => SelfAssessmentUploadFileEntity, (selfAssessmentUploadFile) => selfAssessmentUploadFile.role)
    selfAssessmentUploadFiles: SelfAssessmentUploadFileEntity[];

    @OneToOne(
        () => SelfAssessmentTranslationFileEntity,
        (selfAssessmentTranslationFile) => selfAssessmentTranslationFile.role
    )
    selfAssessmentTranslationFile: SelfAssessmentTranslationFileEntity;

    uploadedSAQ: boolean;
}
