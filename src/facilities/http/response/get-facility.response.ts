import { UserResponse } from '~users/http/response/user.response';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FacilityResponse } from './facility.response';

export class GetFacilityResponse extends FacilityResponse {
    @ApiProperty({ type: UserResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResponse)
    users: UserResponse[];

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityResponse)
    farmGroup: FacilityResponse | null;
}
