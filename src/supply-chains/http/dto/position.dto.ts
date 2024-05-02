import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PositionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    top: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    left: number;
}
