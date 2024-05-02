import { InvitePartnerMetadataType } from './invite-partner-metadata.type';

export type RolePermissionMetadataType = {
    purchaseFrom?: string[];
    sellTo?: string[];
    invitePartner?: InvitePartnerMetadataType[];
    transportTo?: string[];
};
