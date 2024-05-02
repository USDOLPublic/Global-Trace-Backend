import { CONVERSION_RATIO_LBS_TO_KG, CONVERSION_RATIO_UNIT_TO_KG } from '~events/constants/convert-weight.constant';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { roundNumber } from '~core/helpers/number.helper';
import { uniq, upperFirst } from 'lodash';
import { ProductEntity } from '~products/entities/product.entity';

export const convertToKg = (weight: number, weightUnit: string) => {
    if (!weightUnit) {
        return 0;
    }

    switch (upperFirst(weightUnit.toLowerCase())) {
        case WeightUnitEnum.UNIT:
            return roundNumber(weight * CONVERSION_RATIO_UNIT_TO_KG, 2);
        case WeightUnitEnum.LBS:
            return roundNumber(weight * CONVERSION_RATIO_LBS_TO_KG, 2);
        case WeightUnitEnum.KG:
            return roundNumber(weight, 2);
        default:
            return 0;
    }
};

export function calculateTotalWeight(products: { quantity: number; quantityUnit?: string }[]) {
    return products.reduce<number>(
        (previousValue, item) => previousValue + convertToKg(item.quantity, item.quantityUnit),
        0
    );
}

export function isWeightUnit(unit: string): boolean {
    if (!unit) {
        return false;
    }

    switch (upperFirst(unit.toLowerCase())) {
        case WeightUnitEnum.UNIT:
        case WeightUnitEnum.LBS:
        case WeightUnitEnum.KG:
            return true;
        default:
            return false;
    }
}

export function isUsingWeightUnits(products: ProductEntity[]): boolean {
    return products.every(({ quantityUnit }) => isWeightUnit(quantityUnit));
}

export function isUsingSameQuantityUnit(products: ProductEntity[]): boolean {
    const units = products.map(({ quantityUnit }) => (quantityUnit ? quantityUnit.toLowerCase() : quantityUnit));
    return uniq(units).length === 1;
}
