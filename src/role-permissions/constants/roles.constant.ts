import { EventTypeEnum } from '~history/enums/event-type.enum';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';

// Please reading note in `role-permission-mapping.constant.ts` file if needing to update this variable
export const TRANSFORMATION_PARTNER_ROLES: string[] = [UserRoleEnum.GINNER, UserRoleEnum.SPINNER, UserRoleEnum.MILL];

// Please reading note in `role-permission-mapping.constant.ts` file if needing to update this variable
export const CAN_LOGIN_ROLES = [
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.ADMIN,
    UserRoleEnum.BRAND,
    UserRoleEnum.GINNER,
    UserRoleEnum.SPINNER,
    UserRoleEnum.MILL,
    UserRoleEnum.FARM_MONITOR,
    UserRoleEnum.FARM_MONITOR_WEB,
    UserRoleEnum.AUDITOR
];

export const CHAIN_OF_CUSTODY_ENUM = [ChainOfCustodyEnum.PRODUCT_SEGREGATION, ChainOfCustodyEnum.MASS_BALANCE];

export const HISTORY_TRANSACTION = Object.values(EventTypeEnum);
