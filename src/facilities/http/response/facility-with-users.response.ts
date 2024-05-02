import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UserResponse } from '~users/http/response/user.response';
import { FacilityResponse } from './facility.response';

export class FacilityWithUsersResponse extends FacilityResponse {
    @ApiProperty({ type: UserResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResponse)
    users: UserResponse[];
}
