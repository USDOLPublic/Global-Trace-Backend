import { SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';

export type SearchingRoleParamType = {
    sortParams: SortMultipleParams[];
    key?: string;
    type?: RoleTypeEnum;
    excludedRoleIds?: string[];
};
