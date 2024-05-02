import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class TransactionItemResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    transactionId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    entityId: string;
}
