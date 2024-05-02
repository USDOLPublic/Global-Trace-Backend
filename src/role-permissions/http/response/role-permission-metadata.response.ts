import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { InvitePartnerMetadataResponse } from './invite-partner-metadata.response';

export class RolePermissionMetadataResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    purchaseFrom?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sellTo?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvitePartnerMetadataResponse)
    invitePartner?: InvitePartnerMetadataResponse[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    transportTo?: string[];
}
