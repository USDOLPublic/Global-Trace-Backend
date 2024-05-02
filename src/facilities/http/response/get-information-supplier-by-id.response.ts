import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { UserResponse } from '~users/http/response/user.response';
import { FacilityResponse } from './facility.response';

export class GetInformationSupplierByIdResponse extends FacilityResponse {
    @ApiPropertyOptional({ type: UserResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResponse)
    users: UserResponse[] | null;

    @ApiPropertyOptional({ type: FacilityResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityResponse)
    farms: FacilityResponse[] | null;
}
