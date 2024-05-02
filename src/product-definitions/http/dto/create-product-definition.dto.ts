import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateProductDefinitionAttributeDto } from './create-product-definition-attribute.dto';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { Unique } from '~core/http/validators/unique.validator';
import { RequestDto } from '~core/http/dto/request.dto';

export class CreateProductDefinitionDto extends RequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Unique(
        ProductDefinitionEntity,
        'name',
        true,
        [{ column: 'id', exclude: true, value: (obj) => obj.requestDto.params['id'] }],
        { message: 'product_name_already_exists' }
    )
    name: string;

    @ApiProperty({ isArray: true, type: CreateProductDefinitionAttributeDto })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateProductDefinitionAttributeDto)
    attributes: CreateProductDefinitionAttributeDto[];
}
