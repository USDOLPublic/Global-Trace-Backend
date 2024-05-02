import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class FileResponse {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fileName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUrl()
    link: string;
}
