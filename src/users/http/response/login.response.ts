import { ApiProperty } from '@nestjs/swagger';
import { LoginUserResponse } from './login-user.response';
import { IsInt, IsJWT, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginResponse {
    @ApiProperty({
        type: LoginUserResponse
    })
    @ValidateNested()
    @Type(() => LoginUserResponse)
    user: LoginUserResponse;

    @ApiProperty()
    @IsNotEmpty()
    @IsJWT()
    token: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsJWT()
    refreshToken: string;

    @ApiProperty()
    @IsInt()
    expireAt: number;
}
