import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { RoleResponse } from '~role-permissions/http/response/role.response';
import { UserStatusEnum } from '~users/enums/user-status.enum';

export class UserResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phoneNumber: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    firstName: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lastName: string | null;

    @ApiPropertyOptional({
        enum: UserStatusEnum
    })
    @IsOptional()
    @IsEnum(UserStatusEnum)
    status: UserStatusEnum | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704036
    })
    @IsOptional()
    @IsInt()
    lastLoginAt: number;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    deletedAt: number;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    joinedAt: number;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    updatedProfileAt: number;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    answeredSaqAt: number;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    latestActivityAt: number;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    addedPartnerAt: number;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    finishedGuidanceAt: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    totalAwaitingReports: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    roleId: string;

    @ApiPropertyOptional({ type: RoleResponse })
    @ValidateNested()
    @Type(() => RoleResponse)
    role: RoleResponse;
}
