import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GetInviteInformationResponse } from './get-invite-information.response';
import { UserStatusEnum } from '~users/enums/user-status.enum';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class SignUpResponse extends GetInviteInformationResponse {
    @ApiProperty({
        enum: UserStatusEnum
    })
    @IsEnum(UserStatusEnum)
    status: UserStatusEnum;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    joinedAt: number | Date | null;
}
