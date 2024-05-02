import { factory } from '@diginexhk/nestjs-seeder';
import { BaseSeeder } from '~core/seeders/base-seeder';
import { DEVELOPER_USER } from '~users/constants/developer-user.constant';
import { SYSTEM_USER } from '~users/constants/system-user.constant';
import { UserEntity } from '~users/entities/user.entity';
import { UserRepository } from '~users/repositories/user.repository';

export class UserSeed extends BaseSeeder {
    private isExistUser(email: string) {
        return UserRepository.make().findOneBy({ email });
    }

    async run() {
        const seedingUsers = SYSTEM_USER;
        if (process.env.APP_ENV !== 'production') {
            seedingUsers.push(...DEVELOPER_USER);
        }

        for (const seedingUser of seedingUsers) {
            if (!(await this.isExistUser(seedingUser.email))) {
                await factory(UserEntity).saveOne(seedingUser);
            }
        }
    }
}
