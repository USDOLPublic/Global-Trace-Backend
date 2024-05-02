import { FacilityResponse } from '~facilities/http/response/facility.response';
import { OrderResponse } from './order.response';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderWithSupplierResponse extends OrderResponse {
    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => FacilityResponse)
    supplier: FacilityResponse | null;
}
