import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CountryResponse } from '~locations/http/response/country.response';
import { DistrictResponse } from '~locations/http/response/district.response';
import { ProvinceResponse } from '~locations/http/response/province.response';

export class RegisterOarIdConfirmMatchResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    oarId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    countryId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    provinceId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    districtId: string | null;

    @ApiPropertyOptional({ type: CountryResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => CountryResponse)
    country: CountryResponse | null;

    @ApiPropertyOptional({ type: ProvinceResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => ProvinceResponse)
    province: ProvinceResponse | null;

    @ApiPropertyOptional({ type: DistrictResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => DistrictResponse)
    district: DistrictResponse | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    facilityMatchId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isConfirmed?: boolean;
}
