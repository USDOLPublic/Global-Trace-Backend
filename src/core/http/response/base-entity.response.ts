import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class BaseEntityResponse {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsNumber()
    createdAt: number;

    @ApiProperty()
    @IsNumber()
    updatedAt: number;
}
