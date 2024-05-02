import { ApiProperty } from '@nestjs/swagger';

export class ImportSuppliersDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: string;
}
