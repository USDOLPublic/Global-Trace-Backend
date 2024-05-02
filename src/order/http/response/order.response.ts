import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class OrderResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    purchaseOrderNumber: string;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    purchasedAt: Date | number | null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productDescription: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    quantity: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    invoiceNumber: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    packingListNumber: string | null;

    @ApiPropertyOptional()
    @IsUUID()
    creatorId: string | null;

    @ApiPropertyOptional()
    @IsUUID()
    facilityId: string | null;

    @ApiPropertyOptional()
    @IsUUID()
    supplierId: string | null;
}
