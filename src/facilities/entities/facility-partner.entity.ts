import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { UserEntity } from '~users/entities/user.entity';
import { FacilityEntity } from './facility.entity';

@Entity('FacilityPartner')
export class FacilityPartnerEntity extends BaseEntity {
    @Column()
    facilityId: string;

    @Column()
    partnerId: string;

    @Column()
    creatorId: string;

    @Column({ nullable: true })
    @Index()
    typeId: string;

    @Index()
    @Column()
    ownerFacilityId: string;

    @ManyToOne(() => FacilityEntity, (facility) => facility.facilityPartners)
    @JoinColumn({ name: 'facilityId' })
    facility: FacilityEntity;

    @ManyToOne(() => FacilityEntity, (facility) => facility.partnerFacilities)
    @JoinColumn({ name: 'partnerId' })
    partner: FacilityEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn([{ name: 'creatorId', referencedColumnName: 'id' }])
    creator: UserEntity;

    @ManyToOne(() => FacilityEntity, (facility) => facility.supplierPartnerFacilities)
    @JoinColumn([{ name: 'ownerFacilityId' }])
    ownerFacility: FacilityEntity;

    @ManyToOne(() => RoleEntity, (role) => role.facilities)
    @JoinColumn({ name: 'typeId' })
    type: RoleEntity;
}
