import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsNumber, IsUUID, IsOptional } from 'class-validator';
import moment from 'moment';
import { IsSameOrBeforeCurrentDate } from '~core/http/validators/is-same-or-before-current-date.validator';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { Exists } from '~core/http/validators/exists.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { OrderSupplierEntity } from '~order/entities/order-supplier.entity';
import { RequestDto } from '~core/http/dto/request.dto';

export class AddOrderSupplierDto extends RequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id')
    supplierId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(OrderSupplierEntity, 'id', false, [
        {
            column: 'orderId',
            exclude: false,
            value: (obj: AddOrderSupplierDto) => {
                return obj.requestDto.params.id;
            }
        }
    ])
    parentId: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    purchaseOrderNumber?: string;

    @ApiProperty({ type: 'timestamp', default: moment().unix() })
    @IsNumber()
    @IsTimestamp()
    @IsSameOrBeforeCurrentDate()
    purchasedAt: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    invoiceNumber?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    packingListNumber?: string;
}
