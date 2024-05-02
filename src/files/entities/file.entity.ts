import { Column, DeleteDateColumn, Entity } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';

@Entity('File')
export class FileEntity extends BaseEntity {
    @Column()
    blobName: string;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;
}
