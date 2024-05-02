import { BadRequestException, Injectable } from '@nestjs/common';
import { ImportSelfAssessmentFileDto } from '~self-assessments/http/dto/import-self-assessment-file.dto';
import { ValidateImportSaqService } from '~self-assessments/services/import/saq/validate-import-saq.service';
import { ValidateUploadFacilityGroupTemplateService } from '~self-assessments/services/import/facility-group-template/validate-upload-facility-group-template.service';
import { ValidateImportFileType } from '~self-assessments/types/validate-import-file.type';
import { ImportFilesSelfAssessmentType } from '~self-assessments/types/import-files-self-assessment.type';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { COMMUNITY_SHEET_NAME, LABOR_SHEET_NAME } from '~self-assessments/constants/import-saq.constant';
import { partition } from 'lodash';
import { ValidateImportType } from '~self-assessments/types/validate-import.type';

@Injectable()
export class ValidateSelfAssessmentService {
    constructor(
        private validateImportSaqService: ValidateImportSaqService,
        private validateUploadFacilityGroupTemplateService: ValidateUploadFacilityGroupTemplateService,
        private roleService: RoleService
    ) {}

    async validateImport(
        dto: ImportSelfAssessmentFileDto,
        files: ImportFilesSelfAssessmentType
    ): Promise<ValidateImportFileType[]> {
        const canAdminCompletesProfile = await this.roleService.checkRoleHasPermission(
            PermissionEnum.ADMINISTRATOR_COMPLETES_PROFILE,
            dto.roleId
        );
        let result: ValidateImportFileType[] = [];
        if (!files.fileSaq?.[0]) {
            throw new BadRequestException({ translate: 'validation.miss_file_saq' });
        }

        if (canAdminCompletesProfile && !files.fileFacilityGroupTemplate?.[0]) {
            throw new BadRequestException({ translate: 'validation.miss_file_facility_group_template' });
        }
        // Validate file SAQ
        const fileSaq = files.fileSaq[0];
        const validationSaq = await this.validateImportSaqService.validate(fileSaq, canAdminCompletesProfile);
        if (validationSaq.validationErrors.length) {
            result.push({
                fileName: fileSaq.originalname,
                validation: validationSaq
            });
        }
        // Validate file Facility group
        if (canAdminCompletesProfile) {
            result = await this.validFacilityGroup(files, validationSaq, result);
        }

        return result;
    }

    private async validFacilityGroup(
        files: ImportFilesSelfAssessmentType,
        validationSaq: ValidateImportType,
        result: ValidateImportFileType[]
    ) {
        const fileFgt = files.fileFacilityGroupTemplate[0];
        const fileSaq = files.fileSaq[0];
        const validationFgt = await this.validateUploadFacilityGroupTemplateService.validate(fileFgt, fileSaq);
        const [validationFgtErrors, validationSaqErrors] = partition(
            validationFgt.validationErrors,
            (item) => item.sheet !== LABOR_SHEET_NAME && item.sheet !== COMMUNITY_SHEET_NAME
        );
        if (validationSaqErrors.length) {
            if (result.length) {
                result[0].validation.validationErrors = [
                    ...validationSaq.validationErrors,
                    ...validationSaqErrors
                ].sort((a, b) => a.index - b.index || a.sheet.localeCompare(b.sheet));
            } else {
                validationSaq.validationErrors = validationSaqErrors.sort(
                    (a, b) => a.index - b.index || a.sheet.localeCompare(b.sheet)
                );
                result.push({
                    fileName: fileSaq.originalname,
                    validation: validationSaq
                });
            }
        }

        if (validationFgtErrors.length) {
            validationFgt.validationErrors = validationFgtErrors.sort(
                (a, b) => a.index - b.index || a.sheet.localeCompare(b.sheet)
            );
            result.push({
                fileName: fileFgt.originalname,
                validation: validationFgt
            });
        }

        return result;
    }
}
