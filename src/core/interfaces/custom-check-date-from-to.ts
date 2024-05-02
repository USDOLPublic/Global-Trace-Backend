import { ColumnTypes } from '~core/types/column-type.type';
import { BaseEntity } from '~core/entities/base.entity';

export interface CustomCheckDateFromTo {
    table: { new (): BaseEntity };
    column: string;
    value: ((...args: any[]) => ColumnTypes) | ColumnTypes;
}
