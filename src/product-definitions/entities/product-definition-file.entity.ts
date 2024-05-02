import { Column, Entity } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';

@Entity('ProductDefinitionFile')
export class ProductDefinitionFileEntity extends BaseEntity {
    @Column({ type: 'boolean', default: false })
    isValidated: boolean;

    @Column({ type: 'boolean', default: false })
    isImported: boolean;

    @Column()
    blobName: string;
}
