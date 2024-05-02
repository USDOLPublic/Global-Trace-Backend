import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { UserEntity } from '~users/entities/user.entity';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';

@Entity('UserHasPermission')
export class UserHasPermissionEntity extends BaseEntity {
    @Column('uuid')
    public userId!: string;

    @Column('uuid')
    public permissionId!: string;

    @ManyToOne(() => UserEntity, (user) => user.hasPermissions)
    @JoinColumn({ name: 'userId' })
    public user!: UserEntity;

    @ManyToOne(() => PermissionEntity, (permission) => permission.hasUsers)
    @JoinColumn({ name: 'permissionId' })
    public permission!: PermissionEntity;
}
