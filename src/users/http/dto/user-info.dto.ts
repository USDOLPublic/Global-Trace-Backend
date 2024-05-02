import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Unique } from '~core/http/validators/unique.validator';
import { UserEntity } from '~users/entities/user.entity';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { isNil, toLower, trim } from 'lodash';
import { RequestDto } from '~core/http/dto/request.dto';
import { Transform } from 'class-transformer';
import { IsAlphaAndSpace } from '~core/http/validators/is-alpha-and-space.validator';
import { transformToNullIfEmpty } from '~core/helpers/string.helper';

export class UserInfoDto extends RequestDto {
    @ApiProperty()
    @IsEmail()
    @Transform((params) => trim(toLower(params.value)))
    @Unique(UserEntity, 'email', true, undefined, { message: 'The email has already been taken.' })
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsAlphaAndSpace()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsAlphaAndSpace()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    lastName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    @Transform(({ value }) => transformToNullIfEmpty(trim(value)))
    @Unique(UserEntity, 'phoneNumber', true, undefined, { message: 'The phone number has already been taken.' })
    phoneNumber?: string;
}
