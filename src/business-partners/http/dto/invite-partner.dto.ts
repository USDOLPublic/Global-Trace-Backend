import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { isNil } from 'lodash';
import { RequestDto } from '~core/http/dto/request.dto';
import { Exists } from '~core/http/validators/exists.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { UserInfoDto } from '~users/http/dto/user-info.dto';

export class InvitePartnerDto extends RequestDto {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => UserInfoDto)
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    userInformation: UserInfoDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id')
    facilityId?: string;
}
