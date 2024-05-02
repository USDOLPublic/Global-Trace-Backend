import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { StorageService } from '@diginexhk/nestjs-storage';
import { SelfAssessmentUploadFileService } from '~self-assessments/services/self-assessment-upload-file.service';
import { SelfAssessmentGroupService } from '~self-assessments/services/self-assessment-group.service';
import { ImportSelfAssessmentFileDto } from '~self-assessments/http/dto/import-self-assessment-file.dto';
import { SelfAssessmentUploadFileTypeEnum } from '~self-assessments/enums/self-assessment-upload-file-type.enum';
import { SelfAssessmentUploadFileEntity } from '~self-assessments/entities/self-assessment-upload-file.entity';
import { ImportSaqExcelService } from '~self-assessments/services/import/saq/import-saq-excel.service';
import { ImportFilesSelfAssessmentType } from '~self-assessments/types/import-files-self-assessment.type';
import { RoleService } from '~role-permissions/services/role.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';

@Injectable()
export class ImportSelfAssessmentService extends TransactionService {
    constructor(
        private importSaqExcelService: ImportSaqExcelService,
        private storageService: StorageService,
        private selfAssessmentUploadFileService: SelfAssessmentUploadFileService,
        private selfAssessmentGroupService: SelfAssessmentGroupService,
        private roleService: RoleService
    ) {
        super();
    }

    async import(dto: ImportSelfAssessmentFileDto, files: ImportFilesSelfAssessmentType): Promise<{ result: boolean }> {
        const hasPermission = await this.roleService.checkRoleHasPermission(
            PermissionEnum.ADMINISTRATOR_COMPLETES_PROFILE,
            dto.roleId
        );

        if (!files.fileSaq[0]) {
            throw new BadRequestException({ translate: 'validation.miss_file_saq' });
        }

        if (hasPermission && !files.fileFacilityGroupTemplate[0]) {
            throw new BadRequestException({ translate: 'validation.miss_file_facility_group_template' });
        }

        await this.deleteOldData(dto.roleId);

        // Import file SAQ
        const fileSaq = files.fileSaq[0];
        await this.uploadFile(dto.roleId, fileSaq, SelfAssessmentUploadFileTypeEnum.SAQ);
        await this.importSaqExcelService.import(dto, fileSaq);

        // Import file Facility group template
        if (hasPermission) {
            const fileFacilityGroupTemplate = files.fileFacilityGroupTemplate[0];
            await this.uploadFile(
                dto.roleId,
                fileFacilityGroupTemplate,
                SelfAssessmentUploadFileTypeEnum.FACILITY_GROUP_TEMPLATE
            );
        }

        return { result: true };
    }

    async deleteOldData(roleId: string): Promise<void> {
        await this.selfAssessmentGroupService.delete({ roleId });
        await this.selfAssessmentUploadFileService.delete({ roleId, type: SelfAssessmentUploadFileTypeEnum.SAQ });
        await this.selfAssessmentUploadFileService.delete({
            roleId,
            type: SelfAssessmentUploadFileTypeEnum.FACILITY_GROUP_TEMPLATE
        });
    }

    private async uploadFile(
        roleId: string,
        file: Express.Multer.File,
        type: SelfAssessmentUploadFileTypeEnum
    ): Promise<SelfAssessmentUploadFileEntity> {
        const { blobName } = await this.storageService.uploadFile({ file });

        const fileUpload = {
            fileName: file.originalname,
            blobName
        };

        return this.selfAssessmentUploadFileService.create({
            file: fileUpload,
            roleId,
            type
        });
    }
}
