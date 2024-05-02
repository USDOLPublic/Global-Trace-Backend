import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '~core/http/controllers/base.controller';
import { RiskAssessmentService } from '~risk-assessments/services/risk-assessment.service';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { UpdateRiskAssessmentDto } from '../dto/update-risk-assessment.dto';
import { RiskAssessmentResponse } from '../response/risk-assessment.response';
import { RiskAssessmentPropertiesResponse } from '../response/get-risk-assessment-properties.response';
import { RiskAssessmentPropertiesType } from '~risk-assessments/types/risk-assessment-properties.type';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { RoleResponse } from '~role-permissions/http/response/role.response';

@Controller('risk-assessments')
@ApiTags('Risk Assessment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
export class RiskAssessmentController extends BaseController {
    constructor(private riskAssessmentService: RiskAssessmentService) {
        super();
    }

    @Get()
    @ResponseModel(RiskAssessmentResponse)
    @ApiOperation({ description: 'Get risk assessment' })
    getRiskAssessment(): Promise<RiskAssessmentResponse> {
        return this.riskAssessmentService.getRiskAssessment();
    }

    @Put()
    @ApiOperation({ description: 'Update risk assessment' })
    @HttpCode(HttpStatus.NO_CONTENT)
    updateRiskAssessment(@Body() dto: UpdateRiskAssessmentDto) {
        return this.riskAssessmentService.updateRiskAssessment(dto);
    }

    @Get('properties')
    @ApiOperation({ description: 'Get risk assessment properties' })
    @ResponseModel(RiskAssessmentPropertiesResponse)
    hasRiskAssessmentProperties(): Promise<RiskAssessmentPropertiesType> {
        return this.riskAssessmentService.hasRiskAssessmentProperties();
    }

    @Get('submit-report-roles')
    @ApiOperation({ description: 'Get submit report roles' })
    @ResponseModel(RoleResponse, true)
    getSubmitReportRoles(): Promise<RoleEntity[]> {
        return this.riskAssessmentService.getSubmitReportRoles();
    }
}
