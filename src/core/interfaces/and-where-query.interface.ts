import { Brackets } from 'typeorm/query-builder/Brackets';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

export interface AndWhereQuery {
    query: string | Brackets | ((qb: this) => string) | ObjectLiteral | ObjectLiteral[];
    parameters?: ObjectLiteral;
}
