import {
    Column,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne
} from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FloatTransformer } from '~core/transformers/float.transformer';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { DnaTestingEntity } from '~dna-testing/entities/dna-testing.entity';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';
import { CertificationEnum } from '~facilities/enums/certification.enum';
import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { FacilityAdditionalInformationType } from '~facilities/types/facility-additional-information.type';
import { FileEntity } from '~files/entities/file.entity';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { ReportRiskType } from '~grievance-report/types/report-risk.type';
import { CountryEntity } from '~locations/entities/country.entity';
import { DistrictEntity } from '~locations/entities/district.entity';
import { ProvinceEntity } from '~locations/entities/province.entity';
import { ProofUrlTransformer } from '~events/transformers/proof-url.transformer';
import { OrderEntity } from '~order/entities/order.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { SelfAssessmentEntity } from '~self-assessments/entities/self-assessment.entity';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';
import { RiskLevelType } from '~self-assessments/types/risk-level.type';
import { UserEntity } from '~users/entities/user.entity';
import { FacilityPartnerEntity } from './facility-partner.entity';
import { FacilityRiskType } from '~risk-assessments/types/facility-risk.type';

@Entity('Facility')
export class FacilityEntity extends BaseEntity {
    @Column({ nullable: true })
    @Index()
    farmGroupId: string;

    @Column({ nullable: true })
    @Index()
    typeId: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    districtId: string;

    @Column({ nullable: true })
    provinceId: string;

    @Column({ nullable: true })
    countryId: string;

    @Column({ nullable: true })
    traderName: string;

    @Column({ nullable: true })
    oarId: string;

    @Column({ nullable: true })
    businessRegisterNumber: string;

    @Column({ nullable: true })
    chainOfCustody: ChainOfCustodyEnum;

    @Column({ nullable: true })
    certification: CertificationEnum | FarmCertificationEnum;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer(),
        nullable: true
    })
    certificationExpiredDate: Date | number;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer(),
        nullable: true
    })
    reconciliationStartAt: Date | number;

    @Column({ nullable: true })
    reconciliationDuration: string;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @Column({ nullable: true, transformer: new ProofUrlTransformer() })
    logo: string;

    @Column({ type: 'jsonb', select: false })
    riskLevel: RiskLevelType;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: new FloatTransformer() })
    overallRiskScore: number;

    @Column({ nullable: true })
    @Index()
    overallRiskLevel: RiskScoreLevelEnum;

    @Column({ nullable: true })
    additionalRole: AdditionalRoleEnum;

    @Column({ nullable: true })
    @Index()
    facilityGroupFileId: string;

    @Column({ nullable: true })
    farmId: string;

    @Column({ type: 'jsonb' })
    additionalInformation: FacilityAdditionalInformationType;

    @OneToMany(() => OrderEntity, (orders) => orders.facility)
    orders: OrderEntity[];

    @ManyToMany(() => UserEntity, (user) => user.facilities)
    @JoinTable({ name: 'FacilityUser' })
    users: UserEntity[];

    @OneToMany(() => FacilityPartnerEntity, (facilityPartner) => facilityPartner.facility)
    facilityPartners: FacilityPartnerEntity[];

    @OneToMany(() => FacilityPartnerEntity, (facilityPartner) => facilityPartner.partner)
    partnerFacilities: FacilityPartnerEntity[];

    @OneToMany(() => FacilityPartnerEntity, (facilityPartner) => facilityPartner.ownerFacility)
    supplierPartnerFacilities: FacilityPartnerEntity[];

    @OneToMany(() => GrievanceReportEntity, (grievanceReport) => grievanceReport.facility)
    grievanceReports: GrievanceReportEntity[];

    @OneToMany(() => DnaTestingEntity, (dnaTesting) => dnaTesting.requestFacility)
    dnaTesting: DnaTestingEntity[];

    @OneToMany(() => DnaTestingEntity, (dnaTesting) => dnaTesting.productSupplier)
    dna: DnaTestingEntity[];

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'farmGroupId' })
    farmGroup: FacilityEntity;

    @ManyToOne(() => RoleEntity, (role) => role.facilities)
    @JoinColumn({ name: 'typeId' })
    type: RoleEntity;

    @OneToMany(() => FacilityEntity, (farm) => farm.farmGroup)
    farms: FacilityEntity[];

    @OneToOne(() => SelfAssessmentEntity, (selfAssessment) => selfAssessment.forFacility)
    selfAssessment: SelfAssessmentEntity;

    @ManyToOne(() => CountryEntity)
    country: CountryEntity;

    @ManyToOne(() => ProvinceEntity)
    province: ProvinceEntity;

    @ManyToOne(() => DistrictEntity)
    district: DistrictEntity;

    @Column({ nullable: true, type: 'character varying', array: true })
    goods: string[];

    @OneToOne(() => FileEntity)
    @JoinColumn({ name: 'facilityGroupFileId' })
    facilityGroupFile: FileEntity;

    complianceHistory: ReportRiskType[];

    @Column({ type: 'jsonb' })
    riskData: FacilityRiskType;

    get typeName() {
        return this.type?.name;
    }

    get roleType() {
        return this.type?.type;
    }
}
