import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RegisterOarIdDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    countryId: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsUUID()
    provinceId: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsUUID()
    districtId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}
