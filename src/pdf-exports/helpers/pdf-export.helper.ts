import { trans } from '@diginexhk/nestjs-cls-translation';
import { isNil } from 'lodash';
import { I18nHelper } from '~core/helpers/i18n.helper';
import { valueToEnum } from '~core/helpers/value-to-enum.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { COUNTRY_OTHER, PROVINCE_OTHER } from '~locations/constants/location.constant';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TracingSupplierType } from '~order/types/tracing-supplier.type';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';

export function getCottonOriginalOfFacility(isFromPakistan: boolean, facility: FacilityEntity): string {
    if (isFromPakistan) {
        if (!facility.province || facility.province.province === PROVINCE_OTHER) {
            return trans('validation.Others');
        }
        return I18nHelper.getFieldTranslationText(facility.province, 'province');
    }

    if (!facility.country || facility.country.country === COUNTRY_OTHER) {
        return trans('validation.Others');
    }
    return I18nHelper.getFieldTranslationText(facility.country, 'country');
}

export function filterSuppliersByType(
    traceResultList: TracingSupplierType[],
    type: string,
    customCondition: (item: TracingSupplierType) => boolean = () => true
) {
    return traceResultList.filter((traceItem) => traceItem.supplier?.typeName === type && customCondition(traceItem));
}

export function isPurchasedFromFarmGroupOrFarm(transaction: TransactionEntity): boolean {
    const isOutsideFarm = isNil(transaction.fromFacility);
    return [UserRoleEnum.FARM].includes(valueToEnum(UserRoleEnum, transaction.fromFacility?.typeName)) || isOutsideFarm;
}

export function isSellerBroker(transaction): boolean {
    return UserRoleEnum.BROKER === transaction.fromFacility?.typeName;
}
