import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class UploadProductTranslationFileResponse {
    @ApiPropertyOptional()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    size: number;
}
