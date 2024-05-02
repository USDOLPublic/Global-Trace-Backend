import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FarmGroupAdditionalInformationResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tehsil: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    latitude: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    longitude: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    firstNameContactor: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lastNameContactor: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contactPhoneNumber: string | null;
}
