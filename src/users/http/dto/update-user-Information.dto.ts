import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Unique } from '~core/http/validators/unique.validator';
import { UserEntity } from '~users/entities/user.entity';
import { RequestDto } from '~core/http/dto/request.dto';
import { Transform } from 'class-transformer';
import { trim } from 'lodash';
import { IsAlphaAndSpace } from '~core/http/validators/is-alpha-and-space.validator';
import { transformToNullIfEmpty } from '~core/helpers/string.helper';

export class UpdateUserInformationDto extends RequestDto {
    @ApiProperty({ required: false })
    @IsEmail()
    @IsOptional()
    @Transform((params) => trim(params.value))
    @Unique(
        UserEntity,
        'email',
        true,
        [{ column: 'id', exclude: true, value: (obj: UpdateUserInformationDto) => obj.requestDto.user.id }],
        { message: 'The email has already been taken.' }
    )
    email?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsAlphaAndSpace()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    firstName?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsAlphaAndSpace()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => transformToNullIfEmpty(trim(value)))
    @Unique(
        UserEntity,
        'phoneNumber',
        true,
        [{ column: 'id', exclude: true, value: (obj: UpdateUserInformationDto) => obj.requestDto.user.id }],
        { message: 'The phone number has already been taken.' }
    )
    phoneNumber?: string;
}
