import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CalculationItemResponse } from './calculation-item.response';

export class CalculationResponse {
    @ApiProperty({ type: CalculationItemResponse })
    @ValidateNested()
    @Type(() => CalculationItemResponse)
    totalInputs: CalculationItemResponse;

    @ApiProperty({ type: CalculationItemResponse })
    @ValidateNested()
    @Type(() => CalculationItemResponse)
    totalOutputs: CalculationItemResponse;

    @ApiProperty({ type: CalculationItemResponse })
    @ValidateNested()
    @Type(() => CalculationItemResponse)
    totalByProduct: CalculationItemResponse;
}
