import { Id, Pagination, PaginationParams, SortMultipleParams, Sorts } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { BaseController } from '~core/http/controllers/base.controller';
import { QrCodeBatchService } from '~qr-codes/services/qr-code-batch.service';
import { QrCodeService } from '~qr-codes/services/qr-code.service';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { GenerateQrCodesDto } from '../dto/generate-qr-codes.dto';
import { QrCodeBatchPaginationResponse } from '../response/qr-code-batch-pagination.response';
import { QrCodeBatchResponse } from '../response/qr-code-batch.response';
import { QrCodeBatchEntity } from '~qr-codes/entities/qr-code-batch.entity';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';

@Controller('qr-code-batchs')
@ApiTags('QrCode')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.GENERATE_QR_CODES))
export class QrCodeBatchController extends BaseController {
    constructor(
        private connection: Connection,
        private qrCodeService: QrCodeService,
        private qrCodeBatchService: QrCodeBatchService
    ) {
        super();
    }

    @Post()
    @ResponseModel(QrCodeBatchResponse)
    @ApiOperation({ description: 'Admin generates qr codes' })
    @HttpCode(HttpStatus.CREATED)
    generate(@CurrentUser() user: UserEntity, @Body() dto: GenerateQrCodesDto): Promise<QrCodeBatchResponse> {
        return this.connection.transaction((manager) =>
            this.qrCodeBatchService.withTransaction(manager).generate(user, dto)
        );
    }

    @Get()
    @ResponseModel(QrCodeBatchPaginationResponse)
    @ApiOperation({
        description: 'Get list of QR code batches'
    })
    @ApiQuery({ name: 'key', description: 'Search by name', required: false })
    index(
        @Query('key') key: string,
        @Pagination() paginationParams: PaginationParams,
        @Sorts({ allowedFields: ['createdAt'], default: { sortField: 'createdAt', sortDirection: 'DESC' } })
        sortParams: SortMultipleParams[]
    ): Promise<PaginationCollection<QrCodeBatchEntity>> {
        return this.qrCodeBatchService.listQrCodeBatchs(key, paginationParams, sortParams);
    }

    @Get('history')
    @ResponseModel(QrCodeBatchPaginationResponse)
    @ApiOperation({
        description: 'View history of QR codes generated'
    })
    viewHistory(
        @Pagination() paginationParams: PaginationParams,
        @Sorts({
            allowedFields: ['completedAt', 'createdAt'],
            default: { sortField: 'createdAt', sortDirection: 'DESC' }
        })
        sortParams: SortMultipleParams[]
    ): Promise<PaginationCollection<QrCodeBatchEntity>> {
        return this.qrCodeBatchService.viewHistory(paginationParams, sortParams);
    }

    @Delete(':qrCodeBatchId')
    @ApiOperation({ description: 'Delete QR code' })
    @ApiParam({
        name: 'qrCodeBatchId',
        description: 'QR code batch id',
        required: true,
        type: 'string'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteQrCode(@Id('qrCodeBatchId') qrCodeBatchId: string) {
        return this.connection.transaction((manager) =>
            this.qrCodeBatchService.withTransaction(manager).deleteQrCodeById(qrCodeBatchId)
        );
    }

    @Delete()
    @ApiOperation({ description: 'Delete all QR code' })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteDispenseQrCodeBatch() {
        return this.connection.transaction((manager) =>
            this.qrCodeBatchService.withTransaction(manager).deleteDispenseQrCodeBatch()
        );
    }
}
