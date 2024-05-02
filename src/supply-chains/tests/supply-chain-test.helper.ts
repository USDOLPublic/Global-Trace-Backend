import { BaseEntity } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TestHelper } from '~core/tests/test.helper';
import { SupplyChainNodeEntity } from '~supply-chains/entities/supply-chain-node.entity';
import { SupplyChainNodeRepository } from '~supply-chains/repositories/supply-chain-node.repository';

export class SupplyChainTestHelper {
    constructor(private testHelper: TestHelper) {}

    async createSupplyChainNode(options: QueryDeepPartialEntity<SupplyChainNodeEntity> = {}) {
        return SupplyChainNodeRepository.make().createOne({
            ...options
        });
    }

    async visibleInDatabase(entity: typeof BaseEntity, condition) {
        if (typeof condition === 'string') {
            condition = { id: condition };
        }
        if (!(await entity.getRepository().findOneBy(condition))) {
            throw new Error(`${JSON.stringify(condition)} invisible in database`);
        }
    }

    createMany(data: Partial<SupplyChainNodeEntity>[]): Promise<SupplyChainNodeEntity[]> {
        return SupplyChainNodeRepository.make().save(data);
    }
}
