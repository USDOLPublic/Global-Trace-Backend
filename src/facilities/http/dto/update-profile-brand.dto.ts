import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength, IsNotEmpty, IsUUID } from 'class-validator';
import { trim } from 'lodash';
import { Transform } from 'class-transformer';

export class UpdateProfileBrandDto {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    districtId?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsUUID()
    provinceId?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsUUID()
    countryId?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    businessRegisterNumber?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    name?: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    logo?: string;
}
