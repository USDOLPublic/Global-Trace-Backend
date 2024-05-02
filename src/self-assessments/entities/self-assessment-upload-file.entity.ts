import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FileUploadUrlTransformer } from '~core/transformers/file-upload-url.transformer';
import { FileUploadType } from '~core/types/file-upload.type';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { SelfAssessmentUploadFileTypeEnum } from '~self-assessments/enums/self-assessment-upload-file-type.enum';

@Entity('SelfAssessmentUploadFile')
export class SelfAssessmentUploadFileEntity extends BaseEntity {
    @Column({ type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    file: FileUploadType;

    @Column()
    roleId: string;

    @Column()
    type: SelfAssessmentUploadFileTypeEnum;

    @ManyToOne(() => RoleEntity, (role) => role.selfAssessmentUploadFiles)
    @JoinColumn({ name: 'roleId' })
    role: RoleEntity;
}
