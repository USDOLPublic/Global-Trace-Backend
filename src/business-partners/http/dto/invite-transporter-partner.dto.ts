import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { isNil } from 'lodash';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { TransporterInformationDto } from '~users/http/dto/role-information/transporter-information.dto';
import { InvitePartnerDto } from './invite-partner.dto';

export class InviteTransporterPartnerDto extends InvitePartnerDto {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => TransporterInformationDto)
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    transporterInformation: TransporterInformationDto;
}
