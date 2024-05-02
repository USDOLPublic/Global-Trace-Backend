import { Exists } from '@diginexhk/nestjs-base-decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';
import { CategoryEntity } from '~categories/entities/category.entity';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';

export class CategoryFilterDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Transform((param) => parseInt(param.value))
    type?: CategoryTypeEnum;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID('4')
    @Exists(CategoryEntity, 'id')
    parentId?: string;
}
