import { EnumsQuery, Id, Pagination, PaginationParams, Timestamp } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Controller, Get, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import moment from 'moment';
import { BaseController } from '~core/http/controllers/base.controller';
import { EventTypeEnum } from '~history/enums/event-type.enum';
import { HistoryService } from '~history/services/history.service';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';
import { HistoryPagination } from '../response/history-pagination.response';
import { HISTORY_TRANSACTION } from '~role-permissions/constants/roles.constant';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { EventEntity } from '~history/entities/event.entity';

@Controller('histories')
@ApiTags('History')
export class HistoryController extends BaseController {
    constructor(private historyService: HistoryService) {
        super();
    }

    @Get()
    @ResponseModel(HistoryPagination)
    @UseGuards(PermissionGuard(PermissionEnum.VIEW_HISTORY))
    @ApiOperation({ description: 'Check History' })
    @ApiQuery({ name: 'from', required: false, type: 'timestamp', description: 'From time', example: moment().unix() })
    @ApiQuery({ name: 'to', required: false, type: 'timestamp', description: 'To time', example: moment().unix() })
    @ApiQuery({ name: 'types', enum: EventTypeEnum, type: String, required: false })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    index(
        @CurrentUser() user: UserEntity,
        @Pagination() paginationParams: PaginationParams,
        @Timestamp({ key: 'from', nullable: true }) from: number,
        @Timestamp({ key: 'to', nullable: true }) to: number,
        @EnumsQuery({
            enum: HISTORY_TRANSACTION,
            key: 'types',
            nullable: true,
            description: 'Transaction types',
            example: '1;2',
            separator: ';'
        })
        types: EventTypeEnum[]
    ): Promise<PaginationCollection<EventEntity>> {
        return this.historyService.list(user, paginationParams, { from, to }, types);
    }

    @Get('download-documents')
    @UseGuards(ShortTokenGuard, PermissionGuard(PermissionEnum.VIEW_HISTORY))
    @ApiOperation({ description: 'Download documents' })
    @ApiQuery({
        name: 'shortToken',
        description: 'short token',
        required: true,
        type: String
    })
    @ApiQuery({
        name: 'transactionId',
        description: 'Transaction Id or Record Product Id',
        required: true
    })
    @ApiQuery({
        name: 'type',
        required: true,
        type: String
    })
    downloadDocuments(
        @Id('transactionId') transactionId: string,
        @Res() res: Response,
        @Query('type', ParseIntPipe) type: EventTypeEnum
    ) {
        return this.historyService.downloadDocuments(transactionId, res, type);
    }

    @Get('season-start-time')
    @UseGuards(PermissionGuard(PermissionEnum.VIEW_HISTORY))
    @ApiOperation({ description: 'Check History' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    getSeasonStartTime(@CurrentUser() user: UserEntity): Promise<{ seasonStartTime: number; seasonDuration: number }> {
        return this.historyService.getSeasonStartTime(user);
    }
}
