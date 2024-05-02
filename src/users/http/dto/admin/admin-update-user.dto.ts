import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { UpdateUserFacilityDto } from './update-user-facility.dto';
import { UpdateUserDto } from './update-user.dto';

export class AdminUpdateUserDto {
    @ApiProperty({ type: UpdateUserDto })
    @ValidateNested()
    @Type(() => UpdateUserDto)
    user: UpdateUserDto;

    @ApiPropertyOptional({ type: UpdateUserFacilityDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateUserFacilityDto)
    facility?: UpdateUserFacilityDto;
}
