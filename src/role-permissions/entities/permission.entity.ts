import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { RoleHasPermissionEntity } from '~role-permissions/entities/role-has-permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { UserHasPermissionEntity } from '~role-permissions/entities/user-has-permission.entity';
import { GroupTypeEnum } from '~role-permissions/enums/group-type.enum';
import { UserEntity } from '~users/entities/user.entity';

@Entity('Permission')
export class PermissionEntity extends BaseEntity {
    @Column()
    name: string;

    @Column()
    action: string;

    @Column({ type: 'int' })
    sortOrder: number;

    @Column({ nullable: true })
    @Index()
    parentId: string | null;

    @Column({ nullable: true })
    label: string | null;

    @Column({ nullable: true })
    groups: string | null;

    @Column({ nullable: true })
    groupType: GroupTypeEnum;

    @OneToMany(() => RoleHasPermissionEntity, (roleHasPermission) => roleHasPermission.permission)
    hasRoles!: RoleHasPermissionEntity[];

    @OneToMany(() => UserHasPermissionEntity, (userHasPermission) => userHasPermission.permission)
    hasUsers!: UserHasPermissionEntity[];

    @ManyToMany(() => RoleEntity, (role) => role.permissions)
    roles: RoleEntity[];

    @ManyToMany(() => UserEntity, (user) => user.permissions)
    users: UserEntity[];

    @ManyToOne(() => PermissionEntity, (category) => category.subPermissions)
    @JoinColumn({ name: 'parentId' })
    parentPermission: PermissionEntity;

    @OneToMany(() => PermissionEntity, (category) => category.parentPermission)
    subPermissions: PermissionEntity[];
}
