import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ProductCertificationResponse {
    @ApiProperty()
    @IsString()
    fileName?: string | null;

    @ApiProperty()
    @IsString()
    link?: string | null;
}
