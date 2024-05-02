import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { RoleInformationDto } from './role-information.dto';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { isNil } from 'lodash';

export class FarmGroupInformationDto extends RoleInformationDto {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    address: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(FarmCertificationEnum)
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    certification?: FarmCertificationEnum;
}
