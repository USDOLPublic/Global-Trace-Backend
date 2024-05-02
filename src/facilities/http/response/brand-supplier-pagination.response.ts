import { PaginationResponse } from '~core/http/response/pagination.response';
import { BrandGetSupplierListResponse } from './brand-get-supplers.response';
import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BrandSupplierPaginationResponse extends PaginationResponse {
    @ApiProperty({ type: BrandGetSupplierListResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BrandGetSupplierListResponse)
    items: BrandGetSupplierListResponse[];
}
