import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CheckOarIdDto {
    @ApiProperty()
    @IsString()
    oarId: string;

    @ApiProperty({ default: 1 })
    @IsNumber()
    page: number;

    @ApiProperty({ description: 'Maximum is 50 items per page', default: 10 })
    @IsNumber()
    pageSize: number;
}
