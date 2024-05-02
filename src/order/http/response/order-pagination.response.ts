import { PaginationResponse } from '~core/http/response/pagination.response';
import { OrderWithSupplierResponse } from './order-with-supplier.response';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderPaginationResponse extends PaginationResponse {
    @ApiProperty({ type: OrderWithSupplierResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderWithSupplierResponse)
    items: OrderWithSupplierResponse[];
}
