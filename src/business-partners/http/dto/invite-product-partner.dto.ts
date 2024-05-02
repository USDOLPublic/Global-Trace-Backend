import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { isNil } from 'lodash';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { FacilityInformationDto } from './facility-information.dto';
import { InvitePartnerDto } from './invite-partner.dto';

export class InviteProductPartnerDto extends InvitePartnerDto {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => FacilityInformationDto)
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    facilityInformation: FacilityInformationDto;
}
