import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsUUID, ValidateNested } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { BrandInformationDto } from '~users/http/dto/role-information/brand-information.dto';
import { SupplierInformationDto } from '~users/http/dto/role-information/supplier-information.dto';
import { UserInfoDto } from '~users/http/dto/user-info.dto';
import * as faker from 'faker';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';

export class InviteUserDto extends OmitType(UserInfoDto, ['phoneNumber']) {
    @ApiProperty({ example: faker.datatype.uuid() })
    @IsUUID()
    @Exists(RoleEntity, 'id', false, [], {
        message: 'invalid_role_id'
    })
    roleId: string;

    @ApiProperty({ enum: RoleTypeEnum })
    @IsEnum(RoleTypeEnum)
    roleType: RoleTypeEnum;

    @ApiPropertyOptional({ type: BrandInformationDto })
    @ValidateIfOrExclude((obj) => obj.roleType === RoleTypeEnum.BRAND)
    @IsObject()
    @ValidateNested()
    @Type(() => BrandInformationDto)
    brandInformation?: BrandInformationDto;

    @ApiProperty({ type: SupplierInformationDto })
    @ValidateIfOrExclude((obj) => obj.roleType === RoleTypeEnum.PRODUCT)
    @IsObject()
    @ValidateNested()
    @Type(() => SupplierInformationDto)
    supplierInformation: SupplierInformationDto;
}
