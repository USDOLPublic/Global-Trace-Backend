import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UploadProductTranslationErrorResponse {
    @ApiProperty()
    @IsString()
    key: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    error: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    isShowKey: boolean;
}
