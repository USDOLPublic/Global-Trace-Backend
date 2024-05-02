import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { BaseController } from '~core/http/controllers/base.controller';
import { CreateCommunityRiskScanReportDto } from '~grievance-report/http/dto/create-community-risk-scan-report.dto';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { GrievanceReportResponse } from '../response/grievance-report.response';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { Id } from '@diginexhk/nestjs-base-decorator';
import { SubmitGrievanceReportResponseDto } from '../dto/submit-grievance-report-response.dto';
import { GrievanceReportResponseEntityResponse } from '../response/grievance-report-response-entity.response';
import { GrievanceReportService } from '~grievance-report/services/grievance-report.service';
import { RequestService } from '~grievance-report/services/request.service';

@Controller('requests')
@ApiTags('Request')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RequestController extends BaseController {
    constructor(
        private connection: Connection,
        private requestService: RequestService,
        private grievanceReportService: GrievanceReportService
    ) {
        super();
    }

    @Post()
    @UseGuards(PermissionGuard(PermissionEnum.PROACTIVE_ASSESSMENTS))
    @ResponseModel(GrievanceReportResponse)
    @ApiOperation({ description: 'Submit an community risk scan report' })
    @HttpCode(HttpStatus.CREATED)
    createReport(@Body() dto: CreateCommunityRiskScanReportDto, @CurrentUser() user: UserEntity) {
        return this.connection.transaction((manager) =>
            this.requestService.withTransaction(manager).createReport(user, dto)
        );
    }

    @Post(':id/responses')
    @ResponseModel(GrievanceReportResponseEntityResponse)
    @UseGuards(PermissionGuard(PermissionEnum.REACTIVE_ASSESSMENTS))
    @ApiOperation({ description: 'Information partners submit response to grievance report' })
    @ApiParam({
        name: 'id',
        description: 'grievance report id',
        type: 'string'
    })
    @AddRequestToBody()
    @HttpCode(HttpStatus.CREATED)
    submitGrievanceReportResponse(
        @Id() reportId: string,
        @CurrentUser() user: UserEntity,
        @Body() dto: SubmitGrievanceReportResponseDto
    ): Promise<GrievanceReportResponseEntityResponse> {
        return this.connection.transaction((manager) =>
            this.grievanceReportService.withTransaction(manager).submitGrievanceReportResponse(reportId, user, dto)
        );
    }
}
