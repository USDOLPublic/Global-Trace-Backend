import { SupplyChainNodeEntity } from '~supply-chains/entities/supply-chain-node.entity';

export type SupplyChainNodeMapping = {
    hasBrokerIcon: boolean;
} & Partial<SupplyChainNodeEntity>;
