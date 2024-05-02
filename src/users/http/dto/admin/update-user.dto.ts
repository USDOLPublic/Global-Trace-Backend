import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { UserStatusEnum } from '~users/enums/user-status.enum';

export class UpdateUserDto {
    @ApiProperty()
    @IsOptional()
    @IsEnum(UserStatusEnum)
    @IsIn([UserStatusEnum.ACTIVE, UserStatusEnum.DEACTIVATED])
    status?: UserStatusEnum;
}
