import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FileUploadUrlTransformer } from '~core/transformers/file-upload-url.transformer';
import { FileUploadType } from '~core/types/file-upload.type';
import { RoleEntity } from '~role-permissions/entities/role.entity';

@Entity('SelfAssessmentTranslationFile')
export class SelfAssessmentTranslationFileEntity extends BaseEntity {
    @Column({ type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    file: FileUploadType;

    @Column()
    roleId: string;

    @OneToOne(() => RoleEntity, (role) => role.selfAssessmentTranslationFile)
    @JoinColumn({ name: 'roleId' })
    role: RoleEntity;
}
