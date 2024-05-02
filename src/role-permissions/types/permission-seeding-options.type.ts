import { SystemPermissionType } from '~role-permissions/types/system-permission.type';

export type PermissionSeedingOptionsType = Omit<SystemPermissionType, 'group'>;
