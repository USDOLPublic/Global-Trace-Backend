import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { isNil } from 'lodash';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { RelatedPartnerDto } from '~users/http/dto/role-information/related-partner.dto';

export class AddBrokerPartnerDto extends RelatedPartnerDto {
    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    districtId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    provinceId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    countryId: string;
}
