import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { RiskSeverityEnum } from '~taxonomy-exploitations/enums/risk-severity.enum';

export class CategoryResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parentId: string | null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: CategoryTypeEnum })
    @IsEnum(CategoryTypeEnum)
    type: CategoryTypeEnum;

    @ApiProperty({ enum: RiskSeverityEnum })
    @IsEnum(RiskSeverityEnum)
    riskSeverity: RiskSeverityEnum;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    deletedAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId: string | null;

    @ApiPropertyOptional({ type: CategoryResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => CategoryResponse)
    category?: CategoryResponse | null;
}
