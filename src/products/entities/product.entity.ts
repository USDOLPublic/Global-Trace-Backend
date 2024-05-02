import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FileUploadUrlTransformer } from '~core/transformers/file-upload-url.transformer';
import { FloatTransformer } from '~core/transformers/float.transformer';
import { FileUploadType } from '~core/types/file-upload.type';
import { TransactionItemEntity } from '~events/entities/transaction-item.entity';
import { TransformationItemEntity } from '~events/entities/transformation-item.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { QrCodeEntity } from '~qr-codes/entities/qr-code.entity';
import { FacilityItemEntity } from '~events/entities/facility-item.entity';

@Entity('Product')
export class ProductEntity extends BaseEntity {
    @Column()
    productDefinitionId: string;

    @Column({ nullable: true })
    code: string | null;

    @Column({ nullable: true })
    dnaIdentifier: string | null;

    @Column({
        nullable: true,
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        transformer: new FloatTransformer()
    })
    verifiedPercentage: number | null;

    @Column({
        nullable: true,
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        transformer: new FloatTransformer()
    })
    notVerifiedPercentage: number | null;

    @Column({ default: false })
    isPurchased: boolean;

    @Column({ default: false })
    isSold: boolean;

    @Column({ default: false })
    isTransformed: boolean;

    @Column({ default: false })
    isTransported: boolean;

    @Column({ default: false })
    isManualAdded: boolean;

    @Column({ type: 'jsonb' })
    additionalAttributes: { attributeId: string; value: any; quantityUnit?: string }[];

    @Column({ nullable: true })
    createdFacilityId: string | null;

    @Column({ nullable: true, default: null, type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    certifications: FileUploadType[] | null;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0, transformer: new FloatTransformer() })
    quantity: number;

    @Column({ nullable: true })
    quantityUnit?: string;

    @ManyToOne(() => ProductDefinitionEntity)
    @JoinColumn({ name: 'productDefinitionId' })
    productDefinition: ProductDefinitionEntity;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'createdFacilityId' })
    createdFacility: FacilityEntity;

    @OneToOne(() => QrCodeEntity, (qrCode) => qrCode.product)
    qrCode: QrCodeEntity;

    @OneToMany(() => TransactionItemEntity, (transactionItem) => transactionItem.product)
    transactionItems: TransactionItemEntity[];

    @OneToMany(() => TransformationItemEntity, (transformationItem) => transformationItem.product)
    transformationItems: TransformationItemEntity[];

    @OneToMany(() => FacilityItemEntity, (facilityItem) => facilityItem.product)
    facilityItems: FacilityItemEntity[];

    isHavingCertification: boolean;
}
