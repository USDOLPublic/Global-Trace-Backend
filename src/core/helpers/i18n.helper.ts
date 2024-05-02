import { currentLanguage } from '@diginexhk/nestjs-cls-translation';
import { DEFAULT_LANGUAGE } from '~core/constants/default-language.constant';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { I18nField } from '~self-assessments/types/i18n-field.type';

export class I18nHelper {
    static translate<T extends { translation: I18nField }>(items: T[], field: string): T[] {
        const lang = currentLanguage();
        return items.map((item) => {
            if (item.translation[lang]) {
                item[field] = item.translation[lang];
            }
            return item;
        });
    }

    static getFieldTranslationText<T extends { translation: I18nField }>(item: T, field: string): string {
        const lang = currentLanguage();
        if (item.translation[lang]) {
            return item.translation[lang];
        } else if (item.translation[DEFAULT_LANGUAGE]) {
            return item.translation[DEFAULT_LANGUAGE];
        }
        return item[field];
    }

    static translateFacilityLocation(facility: FacilityEntity): FacilityEntity {
        const lang = currentLanguage();

        if (facility.country && facility.country.translation[lang]) {
            facility.country.country = facility.country.translation[lang];
        }

        if (facility.province && facility.province.translation[lang]) {
            facility.province.province = facility.province.translation[lang];
        }

        if (facility.district && facility.district.translation[lang]) {
            facility.district.district = facility.district.translation[lang];
        }

        return facility;
    }
}
