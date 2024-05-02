import { UpdateFacilityDto } from '~facilities/http/dto/update-facility.dto';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';

export function validateRoleUpdateFacilityDto(obj: UpdateFacilityDto): boolean {
    return (
        obj.requestDto.user.role.type === RoleTypeEnum.PRODUCT &&
        obj.requestDto.user.role.chainOfCustody === ChainOfCustodyEnum.MASS_BALANCE
    );
}
