import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { DnaTestingEntity } from '~dna-testing/entities/dna-testing.entity';

export class GetListDnaTestQuery extends BaseQuery<DnaTestingEntity> {
    constructor(private sortParams: SortMultipleParams[], private creatorId?: string) {
        super();
    }

    alias(): string {
        return 'DnaTesting';
    }

    query(query: SelectQueryBuilder<DnaTestingEntity>) {
        if (this.creatorId) {
            query.andWhere({ creatorId: this.creatorId });
        }
        query
            .withDeleted()
            .leftJoinAndSelect('DnaTesting.requestFacility', 'requestFacility')
            .leftJoinAndSelect('DnaTesting.productSupplier', 'productSupplier');
    }

    order(query: SelectQueryBuilder<DnaTestingEntity>) {
        for (const sortParam of this.sortParams) {
            if (!sortParam.field.includes('.')) {
                sortParam.field = `${this.alias()}.${sortParam.field}`;
            }

            query.addOrderBy(sortParam.field, sortParam.direction);
        }
    }
}
