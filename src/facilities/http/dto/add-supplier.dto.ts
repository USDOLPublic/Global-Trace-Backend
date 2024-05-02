import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { isNil, trim } from 'lodash';
import { RequestDto } from '~core/http/dto/request.dto';
import { Exists } from '~core/http/validators/exists.validator';
import { IsAlphaAndSpace } from '~core/http/validators/is-alpha-and-space.validator';
import { Unique } from '~core/http/validators/unique.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { UserEntity } from '~users/entities/user.entity';

export class AddSupplierDto extends RequestDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id')
    facilityId?: string;

    @ApiProperty()
    @IsEmail()
    @Unique(UserEntity, 'email', true, undefined, { message: 'The email has already been taken.' })
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    @Transform((params) => trim(params.value))
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsAlphaAndSpace()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsAlphaAndSpace()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    name: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(RoleEntity, 'id')
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    typeId: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    @Transform((params) => trim(params.value))
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    businessRegisterNumber?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @MaxLength(50)
    @IsOptional()
    @Unique(FacilityEntity, 'oarId', false, undefined, { message: 'duplicated_oar_id' })
    @ValidateIfOrExclude(({ facilityId }) => isNil(facilityId))
    oarId?: string;

    @ApiProperty({ type: String, isArray: true })
    @IsArray()
    @IsUUID('4', { each: true })
    @Exists(FacilityEntity, 'id', false, [], { each: true })
    businessPartnerIds: string[];
}
