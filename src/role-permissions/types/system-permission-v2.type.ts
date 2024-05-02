import { SystemPermissionType } from './system-permission.type';

export type SystemPermissionTypeV2 = SystemPermissionType & {
    set: number;
};
