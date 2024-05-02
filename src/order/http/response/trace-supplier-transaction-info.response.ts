import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TracingSupplierTransactionInfoResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    purchaseOrderNumber?: string;

    @ApiProperty()
    @IsNumber()
    purchasedAt: number | Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    invoiceNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    packingListNumber?: string;
}
