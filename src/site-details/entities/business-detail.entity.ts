import { Column, Entity } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FileUploadUrlTransformer } from '~core/transformers/file-upload-url.transformer';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { FileUploadType } from '~core/types/file-upload.type';

@Entity('BusinessDetail')
export class BusinessDetailEntity extends BaseEntity {
    @Column({ nullable: true })
    name: string;

    @Column()
    sector: string;

    @Column({ nullable: true, type: 'character varying', array: true })
    countryIds: string[];

    @Column({ nullable: true, type: 'character varying', array: true })
    commodities: string[];

    @Column({ type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    logo: FileUploadType;

    @Column({ nullable: true, type: 'timestamp', transformer: new TimestampTransformer() })
    completedConfiguringSystemAt: number | null;
}
