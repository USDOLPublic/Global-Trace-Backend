export const hasAllProperties = <T>(obj: any, type: T): obj is T => {
    for (const key in type) {
        if (!(key in obj) || typeof obj[key] !== type[key as keyof T]) {
            return false;
        }
    }
    return true;
};
