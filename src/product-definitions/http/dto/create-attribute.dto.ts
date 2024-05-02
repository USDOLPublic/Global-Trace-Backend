import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { AttributeOptionDto } from './attribute-option.dto';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';
import { Unique } from '~core/http/validators/unique.validator';
import { RequestDto } from '~core/http/dto/request.dto';

export class CreateAttributeDto extends RequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Unique(
        AttributeEntity,
        'name',
        true,
        [{ column: 'id', exclude: true, value: (obj) => obj.requestDto.params?.['id'] }],
        { message: 'attribute_name_already_exists' }
    )
    name: string;

    @ApiProperty({ enum: FieldTypeEnum, default: FieldTypeEnum.OTHER })
    @IsNotEmpty()
    @IsEnum(FieldTypeEnum)
    type: FieldTypeEnum;

    @ApiProperty({ enum: FieldCategoryEnum })
    @IsNotEmpty()
    @IsEnum(FieldCategoryEnum)
    category: FieldCategoryEnum;

    @ApiProperty({ type: AttributeOptionDto, isArray: true })
    @ValidateIfOrExclude(
        ({ category }) => category === FieldCategoryEnum.LIST || category === FieldCategoryEnum.NUMBER_UNIT_PAIR
    )
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttributeOptionDto)
    options: AttributeOptionDto[];
}
