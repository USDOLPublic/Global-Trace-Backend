import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class CountryResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsString()
    @Length(2)
    countryCode: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    country: string;
}
