import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { SupplyChainNodeEntity } from '../entities/supply-chain-node.entity';

@CustomRepository(SupplyChainNodeEntity)
export class SupplyChainNodeRepository extends BaseRepository<SupplyChainNodeEntity> {
    get alias(): string {
        return 'SupplyChainNode';
    }

    getPartnerRoleIds(roleId: string): Promise<SupplyChainNodeEntity[]> {
        return this.createQueryBuilder(this.alias).where({ roleId }).orWhere({ fromRoleId: roleId }).getMany();
    }
}
