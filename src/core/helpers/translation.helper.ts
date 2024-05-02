import { AVAILABLE_LANGUAGES } from '~core/constants/default-language.constant';

export function addMissingTranslations<T>(items: T[], field: string): T[] {
    for (const item of items) {
        for (const language of AVAILABLE_LANGUAGES) {
            if (!item[field].hasOwnProperty(language)) {
                item[field][language] = '';
            }
        }
    }
    return items;
}
