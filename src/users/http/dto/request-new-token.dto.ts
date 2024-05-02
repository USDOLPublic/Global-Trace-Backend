import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { trim } from 'lodash';

export class RequestNewTokenDto {
    @ApiProperty({
        description: 'Email of user'
    })
    @IsNotEmpty()
    @IsEmail()
    @Transform((params) => trim(params.value))
    email: string;
}
