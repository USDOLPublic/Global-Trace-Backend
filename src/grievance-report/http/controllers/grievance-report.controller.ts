import { Id, Pagination, PaginationParams, SortMultipleParams, Sorts } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { enumToList } from '~core/helpers/enum.helper';
import { BaseController } from '~core/http/controllers/base.controller';
import { EnumToListResponse } from '~core/http/response/enum-to-list.response';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { ReasonEnum } from '~grievance-report/enums/reason.enum';
import { CreateGrievanceReportDto } from '~grievance-report/http/dto/create-grievance-report.dto';
import { EditGrievanceReportDto } from '~grievance-report/http/dto/edit-grievance-report.dto';
import { GrievanceReportService } from '~grievance-report/services/grievance-report.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { UserWithRoleResponse } from '~users/http/response/user-with-role.response';
import { ViewGrievanceReportGuard } from '../guards/view-grievance-report.guard';
import { GetGrievanceReportByIdResponse } from '../response/get-grievance-report-by-id.response';
import { GrievanceReportResponse } from '../response/grievance-report.response';

@Controller('grievance-reports')
@ApiTags('GrievanceReport')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class GrievanceReportController extends BaseController {
    constructor(private grievanceReportService: GrievanceReportService) {
        super();
    }

    @Post()
    @ResponseModel(GrievanceReportResponse)
    @UseGuards(PermissionGuard(PermissionEnum.SUBMIT_GRIEVANCE_REPORTS))
    @ApiOperation({ description: 'Admin create grievance report' })
    @HttpCode(HttpStatus.CREATED)
    createGrievanceReport(
        @CurrentUser() creator: UserEntity,
        @Body() dto: CreateGrievanceReportDto
    ): Promise<GrievanceReportResponse> {
        return this.grievanceReportService.createGrievanceReport(creator, dto);
    }

    @Get()
    @UseGuards(ViewGrievanceReportGuard)
    @ApiOperation({ description: 'Get list grievance report' })
    getListGrievanceReport(
        @CurrentUser() user: UserEntity,
        @Pagination() paginationParams: PaginationParams,
        @Sorts({
            allowedFields: [
                'facility.name',
                'recordedAt',
                'latestActivityAt',
                'reason',
                'createdAt',
                'updatedAt',
                'role.name'
            ],
            default: { sortField: 'createdAt', sortDirection: 'DESC' }
        })
        sort: SortMultipleParams[]
    ) {
        return this.grievanceReportService.getListGrievanceReport(user, paginationParams, sort);
    }

    @Put(':id')
    @UseGuards(PermissionGuard(PermissionEnum.REFER_REPORT_FOR_FOLLOW_UP))
    @ApiOperation({ description: 'Admin edit grievance report' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({
        name: 'id',
        description: 'grievance report id',
        type: 'string'
    })
    editGrievanceReportById(
        @Id() id: string,
        @CurrentUser('id') creatorId: string,
        @Body() dto: EditGrievanceReportDto
    ) {
        return this.grievanceReportService.editGrievanceReportById(id, dto, creatorId);
    }

    @Get('reason-of-audit')
    @ResponseModel(EnumToListResponse, true)
    @ApiOperation({ description: 'Get list of reason-for-audit' })
    getReasonOfAudit(): EnumToListResponse[] {
        return enumToList<typeof ReasonEnum>(ReasonEnum);
    }

    @Get('assignees')
    @ResponseModel(UserWithRoleResponse, true)
    @UseGuards(PermissionGuard(PermissionEnum.SUBMIT_GRIEVANCE_REPORTS))
    @ApiOperation({ description: 'Get assignee grievance report' })
    async listAssignees(): Promise<UserEntity[]> {
        return this.grievanceReportService.listAssignees();
    }

    @Get(':id')
    @ResponseModel(GetGrievanceReportByIdResponse)
    @UseGuards(PermissionGuard(PermissionEnum.SUBMIT_GRIEVANCE_REPORTS, PermissionEnum.VIEW_REPORTS))
    @ApiOperation({ description: 'View grievance report' })
    @ApiParam({
        name: 'id',
        description: 'grievance report id',
        type: 'string'
    })
    getGrievanceReportById(@Id() id: string, @CurrentUser() user: UserEntity): Promise<GrievanceReportEntity> {
        return this.grievanceReportService.getGrievanceReportById(id, user);
    }
}
