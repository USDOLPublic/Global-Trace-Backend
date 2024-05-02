import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { uniq } from 'lodash';
import { CategoryEntity } from '~categories/entities/category.entity';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { transformToArrayIfString } from '~core/helpers/string.helper';
import { Exists } from '~core/http/validators/exists.validator';

export class FacilityRiskFilterDto {
    @ApiProperty({ required: false })
    @Transform(({ value }) => uniq(transformToArrayIfString(value)).filter((item) => item))
    @IsOptional()
    @IsArray()
    sources?: string[];

    @ApiProperty({ required: false })
    @Transform(({ value }) => uniq(transformToArrayIfString(value)).filter((item) => item))
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @Exists(
        CategoryEntity,
        'id',
        false,
        [
            {
                value: CategoryTypeEnum.CATEGORY,
                exclude: false,
                column: 'type'
            }
        ],
        { each: true }
    )
    categoryIds?: string[];

    @ApiProperty({ required: false })
    @Transform(({ value }) => uniq(transformToArrayIfString(value)).filter((item) => item))
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @Exists(
        CategoryEntity,
        'id',
        false,
        [
            {
                value: CategoryTypeEnum.INDICATOR,
                exclude: false,
                column: 'type'
            }
        ],
        { each: true }
    )
    indicatorIds?: string[];

    @ApiProperty({ required: false })
    @Transform(({ value }) => uniq(transformToArrayIfString(value)).filter((item) => item))
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @Exists(
        CategoryEntity,
        'id',
        false,
        [
            {
                value: CategoryTypeEnum.SUB_INDICATOR,
                exclude: false,
                column: 'type'
            }
        ],
        { each: true }
    )
    subIndicatorIds?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    fromTime?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    toTime?: number;
}
