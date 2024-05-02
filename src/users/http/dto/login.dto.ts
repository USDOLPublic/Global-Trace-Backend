import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { trim } from 'lodash';

export class LoginDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    @Transform((params) => trim(params.value))
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
}
