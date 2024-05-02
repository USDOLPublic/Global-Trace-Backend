import { Timestamp } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import moment from 'moment';
import { BaseController } from '~core/http/controllers/base.controller';
import { MarginOfErrorResponse } from '~events/http/response/margin-of-error.response';
import { MassBalanceResponse } from '~events/http/response/mass-balance.response';
import { MarginOfErrorService } from '~events/services/margin-of-error.service';
import { MassBalanceService } from '~events/services/mass-balance.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { CalculationResponse } from '../response/calculation.response';

@Controller('calculations')
@ApiTags('Calculations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CalculationController extends BaseController {
    constructor(private marginOfErrorService: MarginOfErrorService, private massBalanceService: MassBalanceService) {
        super();
    }

    @Get('mass-balance')
    @ResponseModel(MassBalanceResponse)
    @UseGuards(PermissionGuard(PermissionEnum.VIEW_HISTORY))
    @ApiOperation({ description: 'Calculate mass Balance' })
    @ApiQuery({ name: 'from', required: false, type: 'timestamp', description: 'From time', example: moment().unix() })
    @ApiQuery({ name: 'to', required: false, type: 'timestamp', description: 'To time', example: moment().unix() })
    calculateMassBalance(
        @CurrentUser() user: UserEntity,
        @Timestamp({ key: 'from', nullable: true }) from?: number,
        @Timestamp({ key: 'to', nullable: true }) to?: number
    ): Promise<MassBalanceResponse> {
        return this.massBalanceService.calculate(user, { from, to });
    }

    @Get('margin-of-error')
    @ResponseModel(MarginOfErrorResponse)
    @UseGuards(PermissionGuard(PermissionEnum.VIEW_MARGIN_OF_ERROR))
    @ApiOperation({ description: 'Spinner calculate margin of error' })
    @ApiQuery({ name: 'from', required: false, type: 'timestamp', description: 'From time', example: moment().unix() })
    @ApiQuery({ name: 'to', required: false, type: 'timestamp', description: 'To time', example: moment().unix() })
    calculateMarginOfError(
        @CurrentUser() user: UserEntity,
        @Timestamp({ key: 'from', nullable: true }) from?: number,
        @Timestamp({ key: 'to', nullable: true }) to?: number
    ): Promise<MarginOfErrorResponse> {
        return this.marginOfErrorService.calculateMarginOfError(user, { from, to });
    }

    @Get()
    @ResponseModel(CalculationResponse)
    @UseGuards(PermissionGuard(PermissionEnum.VIEW_HISTORY))
    @ApiOperation({ description: 'Spinner calculate margin of error' })
    @ApiQuery({ name: 'from', required: false, type: 'timestamp', description: 'From time', example: moment().unix() })
    @ApiQuery({ name: 'to', required: false, type: 'timestamp', description: 'To time', example: moment().unix() })
    calculate(
        @CurrentUser() user: UserEntity,
        @Timestamp({ key: 'from', nullable: true }) from?: number,
        @Timestamp({ key: 'to', nullable: true }) to?: number
    ): Promise<CalculationResponse> {
        return this.marginOfErrorService.calculate(user, { from, to });
    }
}
