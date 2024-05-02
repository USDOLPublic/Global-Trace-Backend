import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { CAN_LOGIN_ROLES, TRANSFORMATION_PARTNER_ROLES } from '~role-permissions/constants/roles.constant';

/**
 * NOTE_1: When add new roles or permissions, we need to:
 *         +) Create new role, permission file following by format ([roles|permissions-DD-MM-YYYY-v(n)]
 *         +) Add role_permission_mapping_object in the ROLE_PERMISSION_MAPPING too
 *         +) Generate (n) migrations to:
 *              1. (Optional) Add role if adding new role
 *              2. (Optional) Add permission if adding new permission
 *              3. (Required) Add role permission mapping if adding new role or permission
 * NOTE_2: If only update the `roles` property in role_permission_mapping_object (add or remove) need to:
 *         +) Generate migration to update these changes
 */

export const ROLE_PERMISSION_MAPPING = [
    {
        action: 'auth/login_logout',
        roles: CAN_LOGIN_ROLES
    },
    {
        action: 'user/update_profile',
        roles: CAN_LOGIN_ROLES
    },
    {
        action: 'saq/update_saq',
        roles: TRANSFORMATION_PARTNER_ROLES
    },
    {
        action: 'management/manage_admin',
        roles: [UserRoleEnum.ADMIN]
    },
    {
        action: 'management/manage_brand',
        roles: [UserRoleEnum.ADMIN]
    },
    {
        action: 'management/manage_auditor',
        roles: [UserRoleEnum.ADMIN]
    },
    {
        action: 'management/manage_farm_monitor',
        roles: [UserRoleEnum.ADMIN]
    },
    {
        action: 'management/manage_farm',
        roles: [UserRoleEnum.GINNER]
    },
    {
        action: 'management/manage_broker',
        roles: TRANSFORMATION_PARTNER_ROLES
    },
    {
        action: 'management/manage_spinner',
        roles: [UserRoleEnum.GINNER, UserRoleEnum.MILL]
    },
    {
        action: 'management/manage_transporter',
        roles: TRANSFORMATION_PARTNER_ROLES
    },
    {
        action: 'management/manage_ginner',
        roles: [UserRoleEnum.SPINNER, UserRoleEnum.MILL]
    },
    {
        action: 'management/manage_mill',
        roles: [UserRoleEnum.SPINNER]
    },
    {
        action: 'invitation/invite_admin',
        roles: [UserRoleEnum.ADMIN]
    },
    {
        action: 'invitation/invite_brand',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.BRAND]
    },
    {
        action: 'invitation/invite_ginner',
        roles: [UserRoleEnum.BRAND, UserRoleEnum.GINNER, UserRoleEnum.SPINNER]
    },
    {
        action: 'invitation/invite_farm',
        roles: [UserRoleEnum.GINNER]
    },
    {
        action: 'invitation/invite_spinner',
        roles: [UserRoleEnum.BRAND, UserRoleEnum.GINNER, UserRoleEnum.SPINNER]
    },
    {
        action: 'invitation/invite_mill',
        roles: [UserRoleEnum.BRAND, UserRoleEnum.GINNER, UserRoleEnum.SPINNER]
    },
    {
        action: 'invitation/invite_farm_monitor',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.BRAND]
    },
    {
        action: 'invitation/invite_auditor',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.BRAND]
    },
    {
        action: 'invitation/invite_broker',
        roles: [UserRoleEnum.GINNER, UserRoleEnum.SPINNER]
    },
    {
        action: 'invitation/invite_transporter',
        roles: [UserRoleEnum.GINNER, UserRoleEnum.SPINNER]
    },
    {
        action: 'invitation/invite_supplier',
        roles: [UserRoleEnum.ADMIN]
    },
    {
        action: 'management/manage_supplier',
        roles: [UserRoleEnum.ADMIN]
    },
    {
        action: 'transaction/purchase',
        roles: TRANSFORMATION_PARTNER_ROLES
    },
    {
        action: 'transaction/sell',
        roles: [UserRoleEnum.GINNER, UserRoleEnum.SPINNER]
    },
    {
        action: 'transformation/assign_bale_id',
        roles: [UserRoleEnum.GINNER]
    },
    {
        action: 'transaction/transport',
        roles: TRANSFORMATION_PARTNER_ROLES
    },
    {
        action: 'transformation/assign_product_id',
        roles: [UserRoleEnum.SPINNER, UserRoleEnum.MILL]
    },
    {
        action: 'aggregation/record_by_product',
        roles: [UserRoleEnum.SPINNER, UserRoleEnum.MILL]
    },
    {
        action: 'calculation/mass_balance',
        roles: [UserRoleEnum.GINNER, UserRoleEnum.SPINNER, UserRoleEnum.MILL]
    },
    {
        action: 'calculation/margin_of_error',
        roles: [UserRoleEnum.SPINNER, UserRoleEnum.MILL]
    },
    {
        action: 'object/register_oar_id',
        roles: TRANSFORMATION_PARTNER_ROLES
    }
];
