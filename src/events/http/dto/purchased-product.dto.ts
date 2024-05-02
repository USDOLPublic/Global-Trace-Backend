import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ValidateNested
} from 'class-validator';
import { isArray, isNil } from 'lodash';
import moment from 'moment';
import { Exists } from '~core/http/validators/exists.validator';
import { IsSameOrBeforeCurrentDate } from '~core/http/validators/is-same-or-before-current-date.validator';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { Numeric } from '~core/http/validators/numeric.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { CurrencyEnum } from '~events/enums/currency.enum';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductEntity } from '~products/entities/product.entity';
import { ManualAddedDataDto } from './manual-added-data.dto';
import { FileProofDto } from './file-proof.dto';

export class PurchasedProductDto {
    @ApiProperty({ required: false })
    @IsOptional()
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
                column: 'isPurchased'
            }
        ],
        { each: true, message: 'invalid_product_id' }
    )
    productIds?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id')
    fromFacilityId?: string | null;

    @ApiProperty({ required: false })
    @Transform((params) => Number(params.value))
    @IsNumber()
    @Min(1)
    @Numeric(10, 2)
    @IsOptional()
    @ValidateIfOrExclude(({ currency }) => !isNil(currency))
    price?: number;

    @ApiProperty({ enum: CurrencyEnum, required: false })
    @IsNotEmpty()
    @IsEnum(CurrencyEnum)
    @ValidateIfOrExclude(({ price }) => !isNil(price))
    currency?: CurrencyEnum;

    @ApiProperty()
    @Transform((params) => String(params.value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    purchaseOrderNumber: string;

    @ApiProperty({ type: 'timestamp', default: moment().unix() })
    @Transform((params) => Number(params.value))
    @IsNumber()
    @IsTimestamp()
    @IsSameOrBeforeCurrentDate()
    transactedAt: number;

    @ApiProperty({ type: FileProofDto, isArray: true })
    @Type(() => FileProofDto)
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    uploadProofs: FileProofDto[];

    @ApiPropertyOptional({ type: ManualAddedDataDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => ManualAddedDataDto)
    manualAddedData?: ManualAddedDataDto;
}
