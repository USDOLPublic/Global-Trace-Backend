import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { trim } from 'lodash';
import { RequestDto } from '~core/http/dto/request.dto';
import { Exists } from '~core/http/validators/exists.validator';
import { IsAlphaAndSpace } from '~core/http/validators/is-alpha-and-space.validator';
import { Unique } from '~core/http/validators/unique.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';

export class EditSupplierDto extends RequestDto {
    @ApiProperty({ required: false })
    @IsEmail()
    @IsOptional()
    @Transform((params) => trim(params.value))
    email?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsAlphaAndSpace()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    firstName?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @IsAlphaAndSpace()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    lastName?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(255)
    @Transform((params) => trim(params.value))
    name?: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(RoleEntity, 'id')
    typeId: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    @Transform((params) => trim(params.value))
    businessRegisterNumber?: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @MaxLength(50)
    @IsOptional()
    @Unique(
        FacilityEntity,
        'oarId',
        true,
        [{ column: 'id', exclude: true, value: (obj: EditSupplierDto) => obj.requestDto.params.id }],
        { message: 'duplicated_oar_id' }
    )
    oarId?: string;

    @ApiProperty({ required: false, type: String, isArray: true })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @Exists(FacilityEntity, 'id', false, [], { each: true })
    businessPartnerIds?: string[];
}
