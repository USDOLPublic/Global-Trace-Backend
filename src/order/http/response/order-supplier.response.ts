import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class OrderSupplierResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    orderId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    supplierId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    fromSupplierId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parentId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    purchaseOrderNumber: string | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    purchasedAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    invoiceNumber: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    packingListNumber: string | null;
}
