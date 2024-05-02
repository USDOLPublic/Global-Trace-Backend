import { UserResponse } from './user.response';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FacilityResponse } from '~facilities/http/response/facility.response';

export class BrokerGetInvitablePartnersResponse extends FacilityResponse {
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
