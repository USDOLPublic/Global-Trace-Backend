import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';

export const SYSTEM_USER = [
    {
        email: 'admin@usdol.com',
        firstName: 'Admin',
        lastName: 'USDol',
        role: UserRoleEnum.ADMIN
    },
    {
        email: 'spinner@usdol.com',
        firstName: 'Spinner',
        lastName: 'USDol',
        role: UserRoleEnum.SPINNER
    },
    {
        email: 'ginner@usdol.com',
        firstName: 'Ginner',
        lastName: 'USDol',
        role: UserRoleEnum.GINNER
    },
    {
        email: 'mill@usdol.com',
        firstName: 'Mill',
        lastName: 'USDol',
        role: UserRoleEnum.MILL
    },
    {
        email: 'brand@usdol.com',
        firstName: 'Brand',
        lastName: 'USDol',
        role: UserRoleEnum.BRAND
    },
    {
        email: 'auditor@usdol.com',
        firstName: 'Auditor',
        lastName: 'USDol',
        role: UserRoleEnum.AUDITOR
    },
    {
        email: 'farmmonitor@usdol.com',
        firstName: 'Farm Monitor',
        lastName: 'USDol',
        role: UserRoleEnum.FARM_MONITOR
    }
];
