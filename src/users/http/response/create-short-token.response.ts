import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShortTokenResponse {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    shortToken: string;
}
