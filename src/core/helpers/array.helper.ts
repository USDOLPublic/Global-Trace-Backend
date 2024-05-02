export const isArrayEmpty = (arr: any[]): boolean => !(Array.isArray(arr) && arr.length > 0);

export function findUniqueItems<T>(array1: T[], array2: T[]): T[][] {
    const uniqueInArray1 = array1.filter((item) => !array2.includes(item));
    const uniqueInArray2 = array2.filter((item) => !array1.includes(item));
    return [uniqueInArray1, uniqueInArray2];
}
