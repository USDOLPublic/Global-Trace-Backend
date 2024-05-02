import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { RoleInformationDto } from './role-information.dto';
import { trim } from 'lodash';
import { Transform } from 'class-transformer';

export class TransporterInformationDto extends RoleInformationDto {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    address?: string;

    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    @Transform((params) => trim(params.value))
    businessRegisterNumber?: string;
}
