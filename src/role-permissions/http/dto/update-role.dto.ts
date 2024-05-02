import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Length
} from 'class-validator';
import { DEFAULT_DATE_FORMAT_REGEX } from '~core/constants/default-date-format-regex.constant';
import { CustomMatch } from '~core/decorators/custom-match.decorator';
import { RequestDto } from '~core/http/dto/request.dto';
import { Exists } from '~core/http/validators/exists.validator';
import { Unique } from '~core/http/validators/unique.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';

export class UpdateRoleDto extends RequestDto {
    @ApiProperty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsString()
    @Length(1, 255)
    @Unique(
        RoleEntity,
        'name',
        true,
        [{ column: 'id', exclude: true, value: (obj: UpdateRoleDto) => obj.requestDto.params.id }],
        { message: 'existed_role_name' }
    )
    name: string;

    @ApiProperty({ enum: RoleTypeEnum })
    @IsEnum(RoleTypeEnum)
    type: RoleTypeEnum;

    @ApiPropertyOptional({ type: Boolean, example: false })
    @ValidateIfOrExclude(({ type }) => type === RoleTypeEnum.PRODUCT)
    @IsNotEmpty()
    @IsBoolean()
    isRawMaterialExtractor?: boolean;

    @ApiPropertyOptional({ enum: ChainOfCustodyEnum })
    @ValidateIfOrExclude(({ type, isRawMaterialExtractor }) => type === RoleTypeEnum.PRODUCT && !isRawMaterialExtractor)
    @IsNotEmpty()
    @IsEnum(ChainOfCustodyEnum)
    chainOfCustody?: ChainOfCustodyEnum;

    @ApiPropertyOptional({ example: '01/07/2023' })
    @ValidateIfOrExclude(({ type, isRawMaterialExtractor }) => type === RoleTypeEnum.PRODUCT && isRawMaterialExtractor)
    @IsNotEmpty()
    @CustomMatch('seasonStartDate', DEFAULT_DATE_FORMAT_REGEX, {
        message: '$property_invalid_date_format_of_DD/MM/YYYY'
    })
    seasonStartDate?: Date;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ type, isRawMaterialExtractor }) => type === RoleTypeEnum.PRODUCT && isRawMaterialExtractor)
    @IsNotEmpty()
    @IsNumber()
    seasonDuration?: number;

    @ApiProperty({ isArray: true })
    @IsOptional()
    @IsArray()
    @IsUUID(4, { each: true })
    @Exists(PermissionEntity, 'id', false, [], { each: true })
    assignedPermissionIds?: string[];
}
