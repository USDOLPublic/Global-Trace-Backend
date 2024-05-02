import { UserEntity } from '~users/entities/user.entity';

export type SearchingSupplierBusinessPartnerParamType = {
    key?: string;
    requester: UserEntity;
    roleIds: string[];
};
