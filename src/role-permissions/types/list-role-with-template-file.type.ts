import { FileUploadType } from '~core/types/file-upload.type';
import { TemplateFileStatusEnum } from '~self-assessments/enums/template-file-status.enum';

export type ListRoleWithTemplateFile = {
    id: string;
    name: string;
    fileSaq: FileUploadType;
    fileFacilityGroupTemplate: FileUploadType;
    saqStatus: TemplateFileStatusEnum;
    saqTranslationStatus: TemplateFileStatusEnum;
    hasFacilityGroupTemplate: boolean;
    fileSaqTranslation: FileUploadType;
};
