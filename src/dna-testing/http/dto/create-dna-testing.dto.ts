import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import moment from 'moment';
import { convertStringToBoolean, transformToArrayIfString } from '~core/helpers/string.helper';
import { Exists } from '~core/http/validators/exists.validator';
import { IsSameOrBeforeCurrentDate } from '~core/http/validators/is-same-or-before-current-date.validator';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class CreateDnaTestingDto {
    @ApiProperty()
    @IsUUID('4')
    @IsNotEmpty()
    @Exists(FacilityEntity, 'id', false, [])
    requestFacilityId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty()
    @IsUUID('4')
    @IsNotEmpty()
    @Exists(FacilityEntity, 'id')
    productSupplierId: string;

    @ApiProperty({ type: Boolean })
    @IsNotEmpty()
    @Transform(({ value }) => convertStringToBoolean(value))
    @IsBoolean()
    isDetected: boolean;

    @ApiProperty()
    @ValidateIfOrExclude(({ isDetected }) => isDetected)
    @Transform(({ value }) => transformToArrayIfString(value).filter((item) => item.trim()))
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    dnaIdentifiers: string[];

    @ApiProperty({ type: 'timestamp', default: moment().unix() })
    @Transform((params) => Number(params.value))
    @IsNumber()
    @IsTimestamp()
    @IsSameOrBeforeCurrentDate()
    testedAt: number;

    @ApiProperty({ type: 'string', format: 'binary', isArray: true })
    uploadProofs: string[];
}
