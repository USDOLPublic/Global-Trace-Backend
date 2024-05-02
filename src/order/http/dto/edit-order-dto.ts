import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength } from 'class-validator';
import moment from 'moment';
import { IsSameOrBeforeCurrentDate } from '~core/http/validators/is-same-or-before-current-date.validator';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { Exists } from '~core/http/validators/exists.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { RequestDto } from '~core/http/dto/request.dto';
import { IsOptional } from '~core/http/validators/is-optional-custom.validator';

export class EditOrderDto extends RequestDto {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id')
    supplierId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(255)
    purchaseOrderNumber?: string;

    @ApiProperty({ type: 'timestamp', default: moment().unix(), required: false })
    @IsNumber()
    @IsOptional()
    @IsTimestamp()
    @IsSameOrBeforeCurrentDate()
    purchasedAt?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(255)
    productDescription?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    @IsString()
    invoiceNumber?: string;

    @ApiProperty({ required: false })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    @IsNotEmpty()
    quantity?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(255)
    packingListNumber?: string;
}
