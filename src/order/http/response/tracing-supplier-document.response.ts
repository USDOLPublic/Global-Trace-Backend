import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export class TracingSupplierDocumentResponse {
    @ApiProperty({ isArray: true })
    @IsArray()
    @IsString({ each: true })
    transactionIds: string[];

    @ApiProperty()
    @IsBoolean()
    hasProof: boolean;

    @ApiProperty()
    @IsBoolean()
    hasInvoice: boolean;

    @ApiProperty()
    @IsBoolean()
    hasPackingList: boolean;

    @ApiProperty()
    @IsBoolean()
    hasCertification: boolean;
}
