import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { trim } from 'lodash';
import moment from 'moment';
import { transformToArrayIfString } from '~core/helpers/string.helper';
import { RequestDto } from '~core/http/dto/request.dto';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { Unique } from '~core/http/validators/unique.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { CertificationEnum } from '~facilities/enums/certification.enum';
import { validateRoleUpdateFacilityDto } from '~facilities/helpers/validate-update-facility.helper';
export class UpdateFacilityDto extends RequestDto {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    traderName?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    businessRegisterNumber?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(50)
    @Unique(
        FacilityEntity,
        'oarId',
        true,
        [{ column: 'id', exclude: true, value: (obj: UpdateFacilityDto) => obj.requestDto.user.currentFacility.id }],
        { message: 'duplicated_oar_id' }
    )
    oarId?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    name?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    address?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsUUID()
    districtId: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsUUID()
    provinceId: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsUUID()
    countryId: string;

    @ApiProperty({ enum: CertificationEnum, required: false })
    @IsEnum(CertificationEnum)
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    certification?: CertificationEnum;

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => transformToArrayIfString(value))
    goods: string[];

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @MaxLength(255)
    @ValidateIfOrExclude((obj: UpdateFacilityDto) => validateRoleUpdateFacilityDto(obj))
    reconciliationDuration: string;

    @ApiProperty({ type: 'timestamp', default: moment().unix(), required: false })
    @IsNumber()
    @IsTimestamp()
    @ValidateIfOrExclude((obj: UpdateFacilityDto) => validateRoleUpdateFacilityDto(obj))
    reconciliationStartAt: number;
}
