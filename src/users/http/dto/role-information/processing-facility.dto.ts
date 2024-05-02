import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { isNil } from 'lodash';

export class ProcessingFacilityDto {
    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    name: string;
}
