import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { CurrencyEnum } from '~events/enums/currency.enum';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { ProductCertificationResponse } from '~products/http/response/product-certification.response';

export class TransactionResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    fromFacilityId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    toFacilityId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    facilityId: string | null;

    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiPropertyOptional({ enum: CurrencyEnum })
    @IsOptional()
    @IsEnum(CurrencyEnum)
    currency: CurrencyEnum | null;

    @ApiProperty()
    @IsNumber()
    totalWeight: number;

    @ApiPropertyOptional({ enum: WeightUnitEnum })
    @IsOptional()
    @IsEnum(WeightUnitEnum)
    weightUnit: WeightUnitEnum | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    purchaseOrderNumber: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    invoiceNumber: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    packingListNumber: string | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    transactedAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductCertificationResponse)
    uploadProofs: ProductCertificationResponse[] | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductCertificationResponse)
    uploadInvoices: ProductCertificationResponse[] | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductCertificationResponse)
    uploadPackingLists: ProductCertificationResponse[] | null;

    @ApiProperty({ enum: TransactionTypeEnum })
    @IsEnum(TransactionTypeEnum)
    type: TransactionTypeEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    creatorId: string | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    deletedAt: Date | number | null;
}
