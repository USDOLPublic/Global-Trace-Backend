import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ValidateNested
} from 'class-validator';
import { isArray } from 'lodash';
import moment from 'moment';
import { Exists } from '~core/http/validators/exists.validator';
import { IsSameOrBeforeCurrentDate } from '~core/http/validators/is-same-or-before-current-date.validator';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductEntity } from '~products/entities/product.entity';
import { TP_MAIN_WEIGHT_UNITS } from '~events/constants/tp-main-weight-units.constant';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { FileProofDto } from './file-proof.dto';

export class NewTransportDto {
    @ApiProperty({ required: false })
    @Transform((params) => (isArray(params.value) ? params.value : [params.value]))
    @IsArray()
    @IsString({ each: true })
    @Exists(
        ProductEntity,
        'id',
        false,
        [
            {
                value: false,
                exclude: false,
                column: 'isTransported'
            }
        ],
        { each: true, message: 'invalid_product_id' }
    )
    productIds: string[];

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id')
    toFacilityId: string;

    @ApiProperty()
    @Transform((params) => Number(params.value))
    @IsNumber()
    @Min(1)
    totalWeight: number;

    @ApiProperty({ enum: TP_MAIN_WEIGHT_UNITS })
    @IsNotEmpty()
    @IsEnum(TP_MAIN_WEIGHT_UNITS)
    weightUnit: WeightUnitEnum.KG | WeightUnitEnum.LBS;

    @ApiProperty({ type: 'timestamp', default: moment().unix() })
    @Transform((params) => Number(params.value))
    @IsNumber()
    @IsTimestamp()
    @IsSameOrBeforeCurrentDate()
    transactedAt: number;

    @ApiProperty()
    @Transform((params) => String(params.value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    packingListNumber: string;

    @ApiProperty({ type: FileProofDto, isArray: true })
    @Type(() => FileProofDto)
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    uploadPackingLists: FileProofDto[];
}
