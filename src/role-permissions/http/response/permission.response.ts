import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { GroupTypeEnum } from '~role-permissions/enums/group-type.enum';

export class PermissionResponse {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    sortOrder: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    action: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    label: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    groups: string | null;

    @ApiPropertyOptional({ enum: GroupTypeEnum })
    @IsOptional()
    @IsEnum(GroupTypeEnum)
    groupType: GroupTypeEnum | null;
}
