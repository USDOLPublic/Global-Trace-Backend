import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trim } from 'lodash';

export class SupplierInformationDto {
    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    name: string;
}
