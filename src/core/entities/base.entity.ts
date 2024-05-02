import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TimestampTransformer } from '../transformers/timestamp.transformer';
import { BaseEntity as AbstractEntity } from '@diginexhk/typeorm-helper';

export abstract class BaseEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: 'timestamp', transformer: new TimestampTransformer() })
    createdAt: number;

    @UpdateDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    updatedAt: number;
}
