import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateQrCodesDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(1000, { message: 'quantity_must_not_be_greater_than_1000' })
    quantity: number;
}
