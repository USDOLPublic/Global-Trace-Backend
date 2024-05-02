import { FacilityResponse } from '~facilities/http/response/facility.response';
import { DnaTestingResponse } from './dna-testing.response';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDnaTestingListResponse extends DnaTestingResponse {
    @ApiProperty({ type: FacilityResponse })
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacilityResponse)
    @IsOptional()
    requestFacility: FacilityResponse;

    @ApiProperty({ type: FacilityResponse })
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacilityResponse)
    productSupplier: FacilityResponse;
}
