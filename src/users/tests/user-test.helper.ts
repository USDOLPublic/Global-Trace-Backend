import { TestHelper } from '~core/tests/test.helper';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UserEntity } from '~users/entities/user.entity';
import { UserRepository } from '~users/repositories/user.repository';
import faker from 'faker';
import bcrypt from 'bcrypt';
import { DEFAULT_PASSWORD } from '~users/constants/default-password.constant';
import { env } from '~config/env.config';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { OtpRepository } from '~users/repositories/otp.repository';
import { makeAToken } from '~core/helpers/string.helper';
import { UserStatusEnum } from '~users/enums/user-status.enum';
import { JwtService } from '@nestjs/jwt';
import { FindOptionsWhere } from 'typeorm';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { UserHasPermissionRepository } from '~role-permissions/repositories/user-has-permission.repository';

export class UserTestHelper {
    constructor(private testHelper: TestHelper) {}

    async getUser(condition: Partial<UserEntity> = {}) {
        const user = await UserRepository.make().findOneBy(condition as unknown as FindOptionsWhere<UserEntity>);
        if (!user) {
            return this.createUser(condition);
        }

        return user;
    }

    async getUserById(id: string): Promise<UserEntity> {
        return UserRepository.make().findOneBy({ id });
    }

    async createUser(options: QueryDeepPartialEntity<UserEntity> = {}, roleName: string = UserRoleEnum.ADMIN) {
        const role = await RoleRepository.make().findOneBy({ name: roleName });
        return UserRepository.make().createOne({
            email: faker.internet.email(),
            firstName: this.testHelper.fakeFirstName(),
            lastName: this.testHelper.fakeLastName(),
            status: UserStatusEnum.ACTIVE,
            roleId: role.id,
            ...options,
            password: bcrypt.hashSync((options.password as string) || DEFAULT_PASSWORD, env.SALT_ROUND)
        });
    }

    async getToken(user?: UserEntity, password: string = DEFAULT_PASSWORD) {
        if (!user) {
            user = await this.getUser();
        }
        const jwtService = new JwtService({
            secret: env.JWT.SECRET,
            signOptions: {
                expiresIn: env.JWT.EXPIRE,
                algorithm: 'HS512'
            }
        });
        return jwtService.signAsync({ id: user.id, email: user.email });
    }

    updateUser(id: string, options: QueryDeepPartialEntity<UserEntity>) {
        return UserRepository.make().update(id, options);
    }

    getOtp(userId: string) {
        return OtpRepository.make().findOneBy({ userId, isValid: true });
    }

    async getOrCreateOtp(userId: string) {
        const otp = await this.getOtp(userId);
        if (!otp) {
            return this.createOtp(userId);
        }

        return otp;
    }

    createOtp(userId: string, options: QueryDeepPartialEntity<UserEntity> = {}) {
        return OtpRepository.make().createOne({
            token: makeAToken(),
            userId,
            ...options
        });
    }

    async randomPhoneNumber(): Promise<string> {
        const phoneNumber = this.testHelper.fakePhoneNumber();

        if (await UserRepository.make().exists({ phoneNumber })) {
            return this.randomPhoneNumber();
        }

        return phoneNumber;
    }

    async assignPermission(userId: string, permissionAction: PermissionEnum) {
        const permission = await PermissionRepository.make().findOneOrFail({
            where: { action: permissionAction }
        });
        await UserHasPermissionRepository.make().createOne({ userId, permissionId: permission.id });
    }
}
