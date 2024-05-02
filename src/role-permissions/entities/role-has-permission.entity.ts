import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';

@Entity('RoleHasPermission')
export class RoleHasPermissionEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    public roleId!: string;

    @Column('uuid')
    public permissionId!: string;

    @ManyToOne(() => RoleEntity, (role) => role.hasPermissions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'roleId' })
    public role!: RoleEntity;

    @ManyToOne(() => PermissionEntity, (permission) => permission.hasRoles)
    @JoinColumn({ name: 'permissionId' })
    public permission!: PermissionEntity;
}
