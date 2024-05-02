import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DnaTestProofUploadTypeResponse {
    @ApiProperty()
    @IsString()
    @IsOptional()
    fileName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    link?: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    blobName?: string | null;
}
