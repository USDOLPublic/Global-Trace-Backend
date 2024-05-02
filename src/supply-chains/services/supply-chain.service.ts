import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere, In, IsNull } from 'typeorm';
import { allSettled } from '~core/helpers/settled.helper';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { RoleService } from '~role-permissions/services/role.service';
import { SupplyChainNodeEntity } from '~supply-chains/entities/supply-chain-node.entity';
import { AddSupplyChainNodeDto } from '~supply-chains/http/dto/add-supply-chain-node.dto';
import { UpdateSupplyChainNodeDto } from '~supply-chains/http/dto/update-supply-chain-node.dto';
import { SupplyChainNodeRepository } from '~supply-chains/repositories/supply-chain-node.repository';
import { Line } from '~supply-chains/types/line.type';
import { SupplyChainMapping } from '~supply-chains/types/supply-chain-mapping.type';
import { SupplyChainNodeMapping } from '~supply-chains/types/supply-chain-node-mapping.type';

@Injectable()
export class SupplyChainService {
    constructor(
        private supplyChainNodeRepo: SupplyChainNodeRepository,
        private rolePermissionService: RolePermissionService,
        @Inject(forwardRef(() => RoleService)) private roleService: RoleService
    ) {}

    async addSupplyChainNode(dto: AddSupplyChainNodeDto): Promise<SupplyChainNodeMapping> {
        if (dto.fromRoleId) {
            await this.validateSupplyChainNode(dto.roleId, dto.fromRoleId);
        }

        const supplyChainNode = await this.supplyChainNodeRepo.createOne(dto);
        const [roleIdsAllowSale, roleIdsAllowPurchase] = await this.getRoleIdsAllowSaleAndAllowPurchase();

        return {
            ...supplyChainNode,
            hasBrokerIcon:
                roleIdsAllowPurchase.includes(supplyChainNode.roleId) ||
                roleIdsAllowSale.includes(supplyChainNode.fromRoleId)
        };
    }

    async updateSupplyChainNode(id: string, dto: UpdateSupplyChainNodeDto): Promise<void> {
        if (dto.fromRoleId) {
            await this.validateSupplyChainNode(dto.roleId, dto.fromRoleId);
        }

        const { roleId } = await this.supplyChainNodeRepo.findOneOrFail({ select: ['roleId'], where: { id } });

        await allSettled([
            this.supplyChainNodeRepo.update({ id }, dto),
            this.supplyChainNodeRepo.update({ fromRoleId: roleId }, { fromRoleId: dto.roleId })
        ]);
    }

    private async validateSupplyChainNode(roleId: string, fromRoleId: string) {
        await this.validatePurchaseRole(roleId);

        const firstNode = await this.supplyChainNodeRepo.findOneBy({ roleId: fromRoleId, fromRoleId: IsNull() });

        if (!firstNode) {
            await this.validateSaleRole(fromRoleId);
        }
    }

    private async validatePurchaseRole(roleId: string) {
        const canRolePurchase = await this.rolePermissionService.findOne({
            where: { roleId, permission: { action: PermissionEnum.LOG_PURCHASE } },
            relations: ['role']
        });

        if (!canRolePurchase) {
            const role = await this.roleService.findRoleById(roleId);

            throw new BadRequestException({
                translate: 'validation.role_can_not_purchase',
                args: { roleName: role.name }
            });
        }
    }

    private async validateSaleRole(fromRoleId: string) {
        const canRoleSell = await this.rolePermissionService.findOne({
            where: { roleId: fromRoleId, permission: { action: PermissionEnum.LOG_SALE } },
            relations: ['role']
        });

        if (!canRoleSell) {
            const role = await this.roleService.findRoleById(fromRoleId);

            throw new BadRequestException({
                translate: 'validation.role_can_not_sell',
                args: { roleName: role.name }
            });
        }
    }

    async deleteSupplyChainNode(id: string): Promise<DeleteResult> {
        const supplyChainNodes = await this.supplyChainNodeRepo.find();
        const parentNode = supplyChainNodes.find((item) => item.id === id);
        if (!parentNode) {
            throw new NotFoundException({ translate: 'error.not_found.SupplyChainNodeEntity' });
        }
        const nodeIds: string[] = [id];
        this.getNestedNodeIds(supplyChainNodes, [parentNode.roleId], nodeIds);

        return this.supplyChainNodeRepo.delete({ id: In(nodeIds) });
    }

    private getNestedNodeIds(
        supplyChainNodes: SupplyChainNodeEntity[],
        roleIds: string[],
        nodeIds: string[]
    ): string[] {
        if (!roleIds.length) {
            return nodeIds;
        }
        roleIds = supplyChainNodes.reduce((acc, node) => {
            if (roleIds.includes(node.fromRoleId)) {
                acc.push(node.roleId);
                nodeIds.push(node.id);
            }
            return acc;
        }, []);

        return this.getNestedNodeIds(supplyChainNodes, roleIds, nodeIds);
    }

    async deleteByOption(option: FindOneOptions<SupplyChainNodeEntity>): Promise<DeleteResult> {
        const supplyChainNode = await this.supplyChainNodeRepo.findOne(option);
        if (!supplyChainNode) return;
        return this.deleteSupplyChainNode(supplyChainNode.id);
    }

    async getSupplyChain(): Promise<SupplyChainMapping> {
        const nodes = (
            await this.supplyChainNodeRepo.find({
                where: {},
                relations: ['role', 'fromRole', 'outputProductDefinition']
            })
        ).filter(({ role, fromRole, fromRoleId }) => role && (!fromRoleId || fromRole));

        const [roleIdsAllowSale, roleIdsAllowPurchase] = await this.getRoleIdsAllowSaleAndAllowPurchase();

        return { nodes, lines: this.getLines(nodes, roleIdsAllowSale, roleIdsAllowPurchase) };
    }

    private getRoleIdsAllowSaleAndAllowPurchase(): Promise<[string[], string[]]> {
        return Promise.all([
            this.rolePermissionService.findRoleIdsHasPermissionByAction(PermissionEnum.ALLOW_SALE_INTERMEDIARIES),
            this.rolePermissionService.findRoleIdsHasPermissionByAction(PermissionEnum.ALLOW_PURCHASE_INTERMEDIARIES)
        ]);
    }

    private getLines(
        nodes: SupplyChainNodeEntity[],
        roleIdsAllowSale: string[],
        roleIdsAllowPurchase: string[]
    ): Line[] {
        return nodes.reduce((acc: Line[], { fromRoleId, roleId }) => {
            if (!fromRoleId) {
                return acc;
            }

            const toNode = nodes.find((node) => node.roleId === roleId);
            const fromNode = nodes.find((node) => node.roleId === fromRoleId);

            if (toNode && fromNode) {
                acc.push({
                    toNodeId: toNode.id,
                    fromNodeId: fromNode.id,
                    hasBrokerIcon: roleIdsAllowPurchase.includes(roleId) || roleIdsAllowSale.includes(fromRoleId)
                });
            }

            return acc;
        }, []);
    }

    async getPartnerRoleIds(roleId: string): Promise<string[]> {
        const supplyChainNodes = await this.supplyChainNodeRepo.getPartnerRoleIds(roleId);
        const partnerRoleIds: string[] = [];

        for (const node of supplyChainNodes) {
            if (node.fromRoleId === roleId) {
                partnerRoleIds.push(node.roleId);
            } else if (node.roleId === roleId && node.fromRoleId) {
                partnerRoleIds.push(node.fromRoleId);
            }
        }

        return partnerRoleIds;
    }

    async isOutputOfSecondNode(outputProductDefinitionId: string): Promise<boolean> {
        const supplyChainNode = await this.supplyChainNodeRepo.findOne({
            where: { outputProductDefinitionId },
            relations: ['fromRole']
        });
        return supplyChainNode?.fromRole?.isRawMaterialExtractor;
    }

    async doesBuyFromRawMaterialExtractor(roleId: string): Promise<boolean> {
        const preNodeRole = await this.getRoleOfPreviousNode(roleId);
        return preNodeRole?.isRawMaterialExtractor;
    }

    async getRoleOfPreviousNode(roleId: string): Promise<RoleEntity> {
        const supplyChainNode = await this.supplyChainNodeRepo.findOne({
            where: { roleId },
            relations: ['fromRole']
        });
        return supplyChainNode?.fromRole;
    }

    async getRawMaterialExtractorRole(roleId: string): Promise<RoleEntity> {
        do {
            const preNodeRole = await this.getRoleOfPreviousNode(roleId);
            if (!preNodeRole) {
                return;
            }

            if (preNodeRole.isRawMaterialExtractor) {
                return preNodeRole;
            }
            roleId = preNodeRole.id;
        } while (true);
    }

    findSupplyChainNode(options: FindOneOptions<SupplyChainNodeEntity>): Promise<SupplyChainNodeEntity> {
        return this.supplyChainNodeRepo.findOne(options);
    }

    findSupplyChainNodeBy(
        where: FindOptionsWhere<SupplyChainNodeEntity> | FindOptionsWhere<SupplyChainNodeEntity>[]
    ): Promise<SupplyChainNodeEntity> {
        return this.supplyChainNodeRepo.findOneBy(where);
    }

    findSupplyChainNodes(
        where: FindOptionsWhere<SupplyChainNodeEntity> | FindOptionsWhere<SupplyChainNodeEntity>[]
    ): Promise<SupplyChainNodeEntity[]> {
        return this.supplyChainNodeRepo.findBy(where);
    }

    find(options: FindManyOptions<SupplyChainNodeEntity>): Promise<SupplyChainNodeEntity[]> {
        return this.supplyChainNodeRepo.find(options);
    }

    async getRolesOrder(): Promise<{ [key: string]: number }> {
        const nodes = await this.supplyChainNodeRepo.find({ order: { createdAt: 'ASC' } });
        return nodes.map(({ roleId }) => roleId).reduce((o, roleId, index) => ({ ...o, [roleId]: index }), {});
    }
}
