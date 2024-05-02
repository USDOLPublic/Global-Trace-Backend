import { ValidateException } from '@diginexhk/nestjs-exception';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isNil } from 'lodash';
import { RiskAssessmentEntity } from '~risk-assessments/entities/risk-assessment.entity';
import { MethodologyEnum } from '~risk-assessments/enums/methodology.enum';
import { RoleWeightsDto, UpdateRiskAssessmentDto } from '~risk-assessments/http/dto/update-risk-assessment.dto';
import { RiskAssessmentRepository } from '~risk-assessments/repositories/risk-assessment.repository';
import { RiskAssessmentPropertiesType } from '~risk-assessments/types/risk-assessment-properties.type';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';

@Injectable()
export class RiskAssessmentService {
    public constructor(
        private riskAssessmentRepo: RiskAssessmentRepository,
        private rolePermissionService: RolePermissionService
    ) {}

    async getRiskAssessment(): Promise<RiskAssessmentEntity> {
        const riskAssessment = await this.riskAssessmentRepo.findOne({ where: {} });

        if (!riskAssessment) {
            return this.riskAssessmentRepo.createOne({ methodology: MethodologyEnum.HIGHEST_RISK });
        }

        return riskAssessment;
    }

    async updateRiskAssessment(dto: UpdateRiskAssessmentDto) {
        const riskAssessment = await this.getRiskAssessment();

        await this.validateProperties(dto);
        await this.validateRoleWeight(dto.roleWeights);

        const { methodology, geographyWeight, listOfGoodsWeight, saqsWeight, dnaWeight, hotlineWeight, roleWeights } =
            dto;
        return this.riskAssessmentRepo.update(riskAssessment.id, {
            methodology,
            geographyWeight,
            listOfGoodsWeight,
            saqsWeight,
            dnaWeight,
            hotlineWeight,
            roleWeights
        });
    }

    async hasRiskAssessmentProperties(): Promise<RiskAssessmentPropertiesType> {
        const hasDNA = await this.rolePermissionService.existsRoleHasPermission([PermissionEnum.ASSIGN_DNA]);
        const hasSAQ = await this.rolePermissionService.existsRoleHasPermission([
            PermissionEnum.COMPLETE_OWN_SAQ,
            PermissionEnum.ADMINISTRATOR_COMPLETES_SAQ
        ]);
        const hasHotline = await this.rolePermissionService.existsRoleHasPermission([
            PermissionEnum.SUBMIT_GRIEVANCE_REPORTS
        ]);

        return { hasDNA, hasSAQ, hasHotline };
    }

    getSubmitReportRoles(): Promise<RoleEntity[]> {
        return this.rolePermissionService.findRolesByPermission(PermissionEnum.SUBMIT_REPORTS, [RoleTypeEnum.LABOR]);
    }

    private async validateRoleWeight(roleWeights: RoleWeightsDto[]) {
        const submitReportRoles = await this.getSubmitReportRoles();
        const submitReportRoleIds = submitReportRoles.map((role) => role.id);

        for (const roleWeight of roleWeights) {
            if (!submitReportRoleIds.includes(roleWeight.roleId)) {
                throw new BadRequestException({ translate: 'validation.invalid_submit_report_role' });
            }
        }
    }

    private async validateProperties(dto: UpdateRiskAssessmentDto) {
        const { hasSAQ, hasDNA, hasHotline } = await this.hasRiskAssessmentProperties();

        if (dto.methodology === MethodologyEnum.WEIGHTED_AVERAGE) {
            if (hasSAQ && isNil(dto.saqsWeight)) {
                throw new ValidateException([
                    {
                        property: 'saqsWeight',
                        constraints: {
                            invalidField: {
                                message: '$property should not be empty',
                                detail: { property: 'saqsWeight' }
                            } as any
                        }
                    }
                ]);
            }
            if (hasDNA && isNil(dto.dnaWeight)) {
                throw new ValidateException([
                    {
                        property: 'dnaWeight',
                        constraints: {
                            invalidField: {
                                message: '$property should not be empty',
                                detail: { property: 'dnaWeight' }
                            } as any
                        }
                    }
                ]);
            }

            if (hasHotline && isNil(dto.hotlineWeight)) {
                throw new ValidateException([
                    {
                        property: 'hotlineWeight',
                        constraints: {
                            invalidField: {
                                message: '$property should not be empty',
                                detail: { property: 'hotlineWeight' }
                            } as any
                        }
                    }
                ]);
            }
        }
    }
}
