import { BaseQuery } from '@diginexhk/typeorm-helper';
import { IsNull, Not, SelectQueryBuilder } from 'typeorm';
import { QrCodeBatchEntity } from '~qr-codes/entities/qr-code-batch.entity';
import { ILike } from '~core/operators/ilike.operator';
import { GetAndSearchQrCodeBatchParamsType } from '~qr-codes/types/get-and-search-qr-code-batch-param.type';
import { convertStringToSearch } from '~core/helpers/string.helper';

export class GetAndSearchQrCodeBatchQuery extends BaseQuery<QrCodeBatchEntity> {
    constructor(private params: GetAndSearchQrCodeBatchParamsType) {
        super();
    }

    alias(): string {
        return 'QrCodeBatch';
    }

    get key() {
        return this.params.key;
    }

    get isCompleted() {
        return this.params.isCompleted;
    }

    get sortParams() {
        return this.params.sortParams;
    }

    get getCompletedCondition() {
        return {
            completedAt: this.isCompleted ? Not(IsNull()) : IsNull()
        };
    }

    query(query: SelectQueryBuilder<QrCodeBatchEntity>) {
        query.leftJoinAndSelect(`${this.alias()}.creator`, `creator`).where(this.getCompletedCondition);

        if (this.key) {
            query.andWhere({ name: ILike(`%${convertStringToSearch(this.key)}%`) });
        }
    }

    order(query: SelectQueryBuilder<QrCodeBatchEntity>) {
        for (const sortParam of this.sortParams) {
            query.addOrderBy(`${this.alias()}.${sortParam.field}`, sortParam.direction);
        }
    }
}
