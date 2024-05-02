import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UploadedFiles, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { RequireUploadFiles } from '~core/decorators/require-upload-files.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { EventUtilityService } from '~events/services/event-utility.service';
import { EventService } from '~events/services/event.service';
import { RecordProductProofUploadType } from '~events/types/record-product-proof-upload.type';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { AssignProductDto } from '../dto/assign-product.dto';
import { NewTransportDto } from '../dto/new-transport.dto';
import { PurchasedProductDto } from '../dto/purchased-product.dto';
import { RecordProductDto } from '../dto/record-product.dto';
import { SoldProductDto } from '../dto/sold-product.dto';
import { RequiredSellerResponse } from '../response/required-seller.response';
import { TransactedProductResponse } from '../response/transacted-product.response';

@Controller('events')
@ApiTags('Event')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class EventController extends BaseController {
    constructor(
        private connection: Connection,
        private eventService: EventService,
        private eventUtilityService: EventUtilityService
    ) {
        super();
    }

    @Get('purchases/products/:code')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_PURCHASE))
    @ResponseModel(TransactedProductResponse)
    @ApiOperation({ description: 'Scan product to purchase by product ID or QR code' })
    @ApiParam({ name: 'code', description: 'Product ID or QR code', required: true })
    getPurchasedProduct(
        @CurrentUser() user: UserEntity,
        @Param('code') code: string
    ): Promise<TransactedProductResponse> {
        return this.eventService.getPurchasedProduct(user, code);
    }

    @Get('purchases/required-sellers')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_PURCHASE))
    @ResponseModel(RequiredSellerResponse)
    @ApiOperation({ description: 'Is seller required when purchasing the product?' })
    getRequiredProperties(@CurrentUser() user: UserEntity): Promise<RequiredSellerResponse> {
        return this.eventService.isSellerRequired(user);
    }

    @Post('purchases')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_PURCHASE))
    @ApiOperation({ description: 'Purchase a product' })
    @HttpCode(HttpStatus.CREATED)
    purchaseProducts(@CurrentUser() user: UserEntity, @Body() dto: PurchasedProductDto) {
        return this.connection.transaction(async (manager) => {
            const transaction = await this.eventService.withTransaction(manager).purchase(user, dto);

            if (dto?.manualAddedData) {
                await this.eventService.withTransaction(manager).addManualProducts(user, transaction, dto);
            }

            return transaction;
        });
    }

    @Get('sells/products/:code')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_SALE))
    @ResponseModel(TransactedProductResponse)
    @ApiOperation({ description: 'Get a product to sell by product ID or QR code' })
    @ApiParam({ name: 'code', description: 'Product ID or QR code', required: true })
    getSoldProduct(@CurrentUser() user: UserEntity, @Param('code') code: string): Promise<TransactedProductResponse> {
        return this.eventService.getSoldProduct(user, code);
    }

    @Post('sells')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_SALE))
    @ApiOperation({ description: 'Sell a product' })
    @HttpCode(HttpStatus.CREATED)
    sell(@CurrentUser() user: UserEntity, @Body() dto: SoldProductDto) {
        return this.connection.transaction((manager) => this.eventService.withTransaction(manager).sell(user, dto));
    }

    @Post('record-by-product')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_BY_PRODUCT))
    @ApiOperation({ description: 'Mill Record By Product' })
    @ApiConsumes('multipart/form-data')
    @HttpCode(HttpStatus.CREATED)
    @RequireUploadFiles([{ name: 'uploadProofs' }])
    recordByProduct(
        @CurrentUser() user: UserEntity,
        @Body() dto: RecordProductDto,
        @UploadedFiles() files: RecordProductProofUploadType
    ) {
        return this.connection.transaction((manager) =>
            this.eventService.withTransaction(manager).createRecordByProduct(user, dto, files)
        );
    }

    @Post('transports')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_TRANSPORT))
    @ApiOperation({ description: 'Transport a product' })
    @HttpCode(HttpStatus.CREATED)
    transport(@CurrentUser() user: UserEntity, @Body() dto: NewTransportDto) {
        return this.connection.transaction((manager) =>
            this.eventService.withTransaction(manager).transport(user, dto)
        );
    }

    @Get('transports/products/:code')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_SALE))
    @ResponseModel(TransactedProductResponse)
    @ApiOperation({ description: 'Get a product to transport by product ID or QR code' })
    @ApiParam({ name: 'code', description: 'Product ID or QR code', required: true })
    getTransportedProduct(
        @CurrentUser() user: UserEntity,
        @Param('code') code: string
    ): Promise<TransactedProductResponse> {
        return this.eventService.getTransportedProduct(user, code);
    }

    @Post('assign-products')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_TRANSFORMATIONS))
    @ApiOperation({ description: 'Assign products' })
    @HttpCode(HttpStatus.CREATED)
    async assignProductID(@CurrentUser() user: UserEntity, @Body() dto: AssignProductDto) {
        await this.eventUtilityService.authorizeSubPermissionsOfLogTransformation(user, dto);

        return this.connection.transaction((manager) =>
            this.eventService.withTransaction(manager).assignProducts(user, dto)
        );
    }

    @Get('assign-products/products/:code')
    @UseGuards(PermissionGuard(PermissionEnum.LOG_TRANSFORMATIONS))
    @ResponseModel(TransactedProductResponse)
    @ApiOperation({ description: 'Get an input product to transform by product ID or QR code' })
    @ApiParam({ name: 'code', description: 'Product ID or QR code', required: true })
    getInputProduct(@CurrentUser() user: UserEntity, @Param('code') code: string): Promise<TransactedProductResponse> {
        return this.eventService.getInputProduct(user, code);
    }
}
