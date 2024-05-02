import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommoditiesResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    commodity: string;
}
