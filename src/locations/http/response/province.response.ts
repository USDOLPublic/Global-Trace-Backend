import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class ProvinceResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    countryId: string | null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    provinceCode: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    province: string;
}
