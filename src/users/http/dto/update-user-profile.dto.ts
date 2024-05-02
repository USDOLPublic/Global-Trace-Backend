import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { UpdateUserInformationDto } from '~users/http/dto/update-user-Information.dto';
import { UpdateFacilityDto } from '~facilities/http/dto/update-facility.dto';
import { Type } from 'class-transformer';

export class UpdateUserProfileDto {
    @ApiProperty({ type: UpdateUserInformationDto })
    @ValidateNested()
    @Type(() => UpdateUserInformationDto)
    user: UpdateUserInformationDto;

    @ApiProperty({ type: UpdateFacilityDto })
    @ValidateNested()
    @Type(() => UpdateFacilityDto)
    facility: UpdateFacilityDto;
}
