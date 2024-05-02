import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadFilesResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    blobName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    url: string;
}
