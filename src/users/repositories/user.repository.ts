import { UserEntity } from '../entities/user.entity';
import { BaseRepository } from '~core/repositories/base.repository';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { CustomRepository } from '@diginexhk/typeorm-helper';

@CustomRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
    findByEmail(email: string, options?: FindOneOptions<UserEntity>) {
        return this.findOne({ where: { email }, ...options });
    }

    addRole(user: UserEntity, role: RoleEntity) {
        return this.createQueryBuilder().relation(UserEntity, 'role').of(user).add(role);
    }

    findUserById(id: string, options: FindOneOptions<UserEntity>) {
        return this.findById(id, {
            ...options,
            relations: options?.relations || [
                'role',
                'role.permissions',
                'role.hasPermissions',
                'permissions',
                'role.selfAssessmentUploadFiles'
            ]
        });
    }
}
