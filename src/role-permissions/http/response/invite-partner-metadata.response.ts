import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class InvitePartnerMetadataResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    role: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    requiredPartners?: string[];
}
