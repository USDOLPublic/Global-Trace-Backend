import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested
} from 'class-validator';
import { TransactionResponse } from '~events/http/response/transaction.response';
import { FacilityResponse } from '~facilities/http/response/facility.response';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { TracingCategoryEnum } from '~order/enums/tracing-category.enum';
import { RoleResponse } from '~role-permissions/http/response/role.response';
import { TracingSupplierTransactionInfoResponse } from './trace-supplier-transaction-info.response';
import { TracingSupplierDocumentResponse } from './tracing-supplier-document.response';

export class GetTraceResultListResponse {
    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityResponse)
    supplier?: FacilityResponse | null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    orderSupplierId: string;

    @ApiProperty({ enum: TracingCategoryEnum })
    @IsEnum(TracingCategoryEnum)
    category: TracingCategoryEnum;

    @ApiPropertyOptional({ type: TracingSupplierTransactionInfoResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => TracingSupplierTransactionInfoResponse)
    transactionInfo?: TracingSupplierTransactionInfoResponse | null;

    @ApiPropertyOptional({ isArray: true })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    productIds?: string[] | null;

    @ApiProperty()
    @IsOptional()
    @IsString()
    fromSupplierId?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiProperty()
    @IsBoolean()
    isRoot: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    transactionId?: string;

    @ApiPropertyOptional({ enum: TransactionTypeEnum })
    @IsOptional()
    @IsEnum(TransactionTypeEnum)
    transactionType?: TransactionTypeEnum;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    transactedAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    tracedPurchasedAtLevel?: number | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    tracedPurchasedAt?: Date | number | null;

    @ApiPropertyOptional({ type: TransactionResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TransactionResponse)
    transactions?: TransactionResponse[] | null;

    @ApiPropertyOptional({ type: TracingSupplierDocumentResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => TracingSupplierDocumentResponse)
    document?: TracingSupplierDocumentResponse | null;

    @ApiPropertyOptional({ type: RoleResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => RoleResponse)
    role?: RoleResponse | null;
}
