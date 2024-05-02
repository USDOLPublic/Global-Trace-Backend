import { Transform } from 'class-transformer';
import { trim } from 'lodash';
import {
    Column,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany
} from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { LowerTransformer } from '~core/transformers/lower.transformer';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { FacilityPartnerEntity } from '~facilities/entities/facility-partner.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { LaborRiskEntity } from '~grievance-report/entities/labor-risk.entity';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { UserHasPermissionEntity } from '~role-permissions/entities/user-has-permission.entity';
import { UserStatusEnum } from '~users/enums/user-status.enum';

@Entity('User')
export class UserEntity extends BaseEntity {
    @Index()
    @Transform((params) => trim(params.value))
    @Column({ transformer: new LowerTransformer() })
    email: string;

    @Index()
    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ select: false, nullable: true })
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ default: UserStatusEnum.INVITED })
    status: UserStatusEnum;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    lastLoginAt: Date;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    joinedAt: Date;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    updatedProfileAt: number | Date;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    answeredSaqAt: number | Date;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    latestActivityAt: number | Date;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    addedPartnerAt: number | Date;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    finishedGuidanceAt: number | Date;

    @Column({ type: 'int', select: false, insert: false, update: false, readonly: true, nullable: true })
    totalAwaitingReports: number;

    @Column({ nullable: true })
    @Index()
    public roleId: string | null;

    @OneToMany(() => UserHasPermissionEntity, (userHasPermission) => userHasPermission.user)
    hasPermissions!: UserHasPermissionEntity[];

    @ManyToMany(() => PermissionEntity, (permission) => permission.users)
    @JoinTable({ name: 'UserHasPermission' })
    permissions: PermissionEntity[];

    @ManyToMany(() => FacilityEntity, (facility) => facility.users)
    facilities: FacilityEntity[];

    @OneToMany(() => FacilityPartnerEntity, (facilityPartner) => facilityPartner.creator)
    facilityPartners: FacilityPartnerEntity[];

    @OneToMany(() => GrievanceReportEntity, (grievanceReport) => grievanceReport.assignee)
    grievanceReports: GrievanceReportEntity[];

    @OneToMany(() => LaborRiskEntity, (laborRisk) => laborRisk.creator)
    laborRisks: LaborRiskEntity[];

    @ManyToOne(() => RoleEntity, (role) => role.users)
    @JoinColumn({ name: 'roleId' })
    public role!: RoleEntity;

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    get roleName() {
        return this.role?.name;
    }

    currentFacility: FacilityEntity;
}
