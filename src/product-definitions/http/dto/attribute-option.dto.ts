import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttributeOptionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    value: string;
}
