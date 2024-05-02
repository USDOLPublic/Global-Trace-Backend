import { PaginationParams } from '@diginexhk/nestjs-base-decorator';
import { BaseEntity, EntityCollection, PaginationCollection } from '@diginexhk/typeorm-helper';

export function generatePaginateCollection<T>(
    params: PaginationParams,
    total?: number,
    items?: EntityCollection<BaseEntity> | T[]
): PaginationCollection<T> {
    const { perPage, page } = params;
    const validTotal = total || 0;
    const lastPage = Math.ceil(validTotal / perPage);
    return new PaginationCollection({
        total: validTotal,
        lastPage: lastPage || 1,
        perPage: perPage,
        currentPage: page,
        items: items || []
    });
}

export function camelCaseToSnakeCase(obj) {
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            let snakeCaseKey = key.replace(/([A-Z])/g, (match) => {
                return '_' + match.toLowerCase();
            });

            if (typeof obj[key] === 'object') {
                result[snakeCaseKey] = camelCaseToSnakeCase(obj[key]);
            } else {
                result[snakeCaseKey] = obj[key];
            }
        }
    }
    return result;
}
