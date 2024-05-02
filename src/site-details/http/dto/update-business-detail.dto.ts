import { ExistIds } from '@diginexhk/nestjs-base-decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { transformToArrayIfString } from '~core/helpers/string.helper';
import { CountryEntity } from '~locations/entities/country.entity';
import Commodities from '~site-details/constants/goods.json';

export class UpdateBusinessDetailDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty()
    @IsUUID('4', { each: true })
    @IsNotEmpty()
    @IsArray()
    @ExistIds(CountryEntity, true)
    @Transform(({ value }) => transformToArrayIfString(value))
    countryIds: string[];

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsEnum(Commodities.map((item) => item.commodity), { each: true })
    @Transform(({ value }) => transformToArrayIfString(value))
    commodities: string[];

    @ApiProperty({ type: 'string', format: 'binary' })
    logo: string;
}
