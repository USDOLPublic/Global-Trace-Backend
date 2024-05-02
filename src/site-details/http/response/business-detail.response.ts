import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { DnaTestProofUploadTypeResponse } from '~dna-testing/http/response/dna-testing-proof-upload-type.response';
import { CountryResponse } from '~locations/http/response/country.response';

export class BusinessDetailResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sector: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    countryIds: string[];

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    commodities: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => DnaTestProofUploadTypeResponse)
    logo: DnaTestProofUploadTypeResponse | null;

    @ApiPropertyOptional({ type: CountryResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => CountryResponse)
    country: CountryResponse | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    completedConfiguringSystemAt?: number | null;
}
