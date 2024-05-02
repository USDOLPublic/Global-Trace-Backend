import { IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import moment from 'moment';
import { IsSameOrBeforeCurrentDate } from '~core/http/validators/is-same-or-before-current-date.validator';
import { TP_MAIN_WEIGHT_UNITS } from '~events/constants/tp-main-weight-units.constant';
import { Numeric } from '~core/http/validators/numeric.validator';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';

export class RecordProductDto {
    @ApiProperty()
    @Transform((params) => Number(params.value))
    @IsNumber()
    @Min(1)
    @Numeric(10, 2)
    totalWeight: number;

    @ApiProperty({ enum: TP_MAIN_WEIGHT_UNITS })
    @IsNotEmpty()
    @IsEnum(TP_MAIN_WEIGHT_UNITS)
    weightUnit: WeightUnitEnum;

    @ApiProperty({ type: 'timestamp', default: moment().unix() })
    @Transform((params) => Number(params.value))
    @IsNumber()
    @IsTimestamp()
    @IsSameOrBeforeCurrentDate()
    recordedAt: number;

    @ApiProperty({ type: 'string', format: 'binary', isArray: true })
    uploadProofs: string[];
}
