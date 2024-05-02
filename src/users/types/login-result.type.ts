import { UserEntity } from '~users/entities/user.entity';

export type LoginResultType = {
    user: UserEntity;
    token: string;
    refreshToken: string;
    expireAt: number;
};
