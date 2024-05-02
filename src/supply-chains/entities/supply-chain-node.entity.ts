import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { SupplyPositionType } from '~supply-chains/types/supply-position.type';

@Entity('SupplyChainNode')
export class SupplyChainNodeEntity extends BaseEntity {
    @Index()
    @Column()
    roleId: string;

    @Index()
    @Column({ nullable: true })
    fromRoleId?: string | null;

    @Index()
    @Column()
    outputProductDefinitionId: string;

    @Column({ type: 'jsonb' })
    position: SupplyPositionType;

    @ManyToOne(() => RoleEntity)
    @JoinColumn({ name: 'roleId' })
    role: RoleEntity;

    @ManyToOne(() => RoleEntity)
    @JoinColumn({ name: 'fromRoleId' })
    fromRole: RoleEntity;

    @ManyToOne(() => ProductDefinitionEntity)
    @JoinColumn({ name: 'outputProductDefinitionId' })
    outputProductDefinition: ProductDefinitionEntity;
}
