import { SupplyChainNodeEntity } from '~supply-chains/entities/supply-chain-node.entity';
import { Line } from './line.type';

export type SupplyChainMapping = {
    nodes: SupplyChainNodeEntity[];
    lines: Line[];
};
