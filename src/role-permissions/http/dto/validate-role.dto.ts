import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class ValidateRoleDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    id?: string;

    @ApiProperty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsString()
    @Length(1, 255)
    name: string;
}
