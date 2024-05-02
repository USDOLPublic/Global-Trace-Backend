import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RequiredSellerResponse {
    @ApiProperty()
    @IsBoolean()
    isSellerRequired: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nonParticipatingRoleName?: string | null;
}
