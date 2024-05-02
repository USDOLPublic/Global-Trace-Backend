import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class DistrictResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    provinceId: string | null;

    @ApiProperty()
    @IsNumber()
    districtCode: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    district: string;
}
