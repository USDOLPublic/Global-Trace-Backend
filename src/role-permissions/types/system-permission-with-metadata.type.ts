import { RolePermissionMetadataType } from './role-permission-metadata.type';

export type SystemPermissionWithMetadataType = {
    id: string;
    name: string;
    action: string;
    group: string;
    set: number;
    metadata?: RolePermissionMetadataType;
};
