export function valueToEnum<T>(enumType: T, value: string | number): T[keyof T] {
    const entry = Object.entries(enumType).find((x) => x[1] === value);

    if (!entry) {
        return undefined;
    }

    return enumType[entry[0] as keyof T];
}
