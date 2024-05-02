import bcrypt from 'bcrypt';
import faker from 'faker';
import { plainToClassFromExist } from 'class-transformer';
import { env } from '~config/env.config';
import { DEFAULT_PASSWORD } from '~users/constants/default-password.constant';
import { define } from '@diginexhk/nestjs-seeder';
import { UserEntity } from '~users/entities/user.entity';
import { getRoleIdByRoleName } from '~role-permissions/helpers/get-role-id-by-role-name.helper';
import { UserSeedingOptionsType } from '~users/types/user-seeding-options.type';

define(UserEntity, (options: UserSeedingOptionsType) => {
    const { email, firstName, lastName, role } = options;
    const gender = faker.datatype.number(1);
    const fName = firstName || faker.name.firstName(gender);
    const lName = lastName || faker.name.lastName(gender);
    const mail = email || faker.internet.email(fName, lName);
    const userId = faker.datatype.uuid();

    const user = new UserEntity();
    user.id = userId;
    user.email = mail;
    user.password = bcrypt.hashSync(DEFAULT_PASSWORD, env.SALT_ROUND);
    user.firstName = fName;
    user.lastName = lName;
    user.phoneNumber = faker.phone.phoneNumber();
    user.roleId = getRoleIdByRoleName(role);

    return plainToClassFromExist(user, options || {}, {});
});
