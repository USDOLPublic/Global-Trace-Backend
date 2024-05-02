import { EnumValueType } from '~facilities/types/enum-value.type';
import { EnumKeyType } from '~core/enums/enum-key.type';

export function getEnumKeys<E>(enumData: E, enumKeyType: EnumKeyType = EnumKeyType.STRING): (keyof E)[] {
    const enumKeys: (keyof E)[] = Object.keys(enumData) as (keyof E)[];

    switch (enumKeyType) {
        case EnumKeyType.ALL:
            return enumKeys;
        case EnumKeyType.NUMBER:
            return enumKeys.filter((key: keyof E) => typeof key === EnumKeyType.NUMBER);
        case EnumKeyType.SYMBOL:
            return enumKeys.filter((key: keyof E) => typeof key === EnumKeyType.SYMBOL);
        default:
            return enumKeys.filter((key: keyof E) =>
                typeof key === EnumKeyType.STRING ? Number.isNaN(parseFloat(key as string)) : false
            );
    }
}

export function getEnumValues<E>(enumData: E): E[keyof E][] {
    return (getEnumKeys(enumData) as string[]).map((key: string) => enumData[key]);
}

export function enumToList<E>(enumData: E): EnumValueType<E, keyof E>[] {
    return (getEnumKeys(enumData) as string[]).map((key: string) => ({
        id: key,
        name: enumData[key]
    }));
}

export function pickEnumByKeys<E, K extends keyof E>(enumData: E, keys: Partial<K>[]): any[] {
    return (getEnumKeys(enumData) as string[]).reduce((acc: E[K][], key: string) => {
        if (keys.includes(key as unknown as Partial<K>)) {
            acc.push(enumData[key]);
        }

        return acc;
    }, []);
}
