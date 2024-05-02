import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsNumber, IsUUID, IsOptional } from 'class-validator';
import moment from 'moment';
import { IsSameOrBeforeCurrentDate } from '~core/http/validators/is-same-or-before-current-date.validator';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { Exists } from '~core/http/validators/exists.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class CreateOrderDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id')
    supplierId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    purchaseOrderNumber: string;

    @ApiProperty({ type: 'timestamp', default: moment().unix() })
    @IsNumber()
    @IsTimestamp()
    @IsSameOrBeforeCurrentDate()
    purchasedAt: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    productDescription: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    invoiceNumber?: string;

    @ApiProperty()
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    quantity: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    packingListNumber?: string;
}
