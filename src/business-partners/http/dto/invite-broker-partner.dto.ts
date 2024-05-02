import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import faker from 'faker';
import { isNil, trim } from 'lodash';
import { Exists } from '~core/http/validators/exists.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { RoleInformationDto } from '~users/http/dto/role-information/role-information.dto';
import { InvitePartnerDto } from './invite-partner.dto';

export class BrokerPartnerInformationDto extends RoleInformationDto {
    @ApiProperty({ example: faker.datatype.uuid() })
    @IsNotEmpty()
    @IsUUID()
    @Exists(RoleEntity, 'id')
    roleId: string;
}

export class BrokerPartnerDto extends InvitePartnerDto {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => BrokerPartnerInformationDto)
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    partnerInformation: BrokerPartnerInformationDto;
}

export class BrokerInformationDto extends RoleInformationDto {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    address?: string;

    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    @Transform((params) => trim(params.value))
    businessRegisterNumber?: string;
}

export class InviteBrokerPartnerDto extends InvitePartnerDto {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => BrokerInformationDto)
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    brokerInformation: BrokerInformationDto;

    @ApiProperty({ type: BrokerPartnerDto, isArray: true, required: false })
    @IsArray()
    @Type(() => BrokerPartnerDto)
    @ValidateNested({ each: true })
    @IsOptional()
    partners?: BrokerPartnerDto[];
}
