import { UserEntity } from '~users/entities/user.entity';

export type LoginResponseType = {
    user: Partial<UserEntity> & { completedConfiguringSystemAt?: number | null };
    token: string;
    refreshToken: string;
    expireAt: number;
};
