import { RolePermissionMetadataType } from './role-permission-metadata.type';

export type RolePermissionType = {
    id: string;
    roleId: string;
    permissionId: string;
    metadata?: RolePermissionMetadataType;
};
