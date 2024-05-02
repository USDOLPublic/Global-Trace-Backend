import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileProofDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    blobName: string;
}
