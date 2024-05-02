import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CategoryResponse } from '~categories/http/response/category.response';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';

export class LaborRiskResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    entityId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    entityType: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    indicatorId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    subIndicatorId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(SeverityEnum)
    severity: SeverityEnum;

    @ApiProperty({ type: CategoryResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => CategoryResponse)
    indicator?: CategoryResponse | null;

    @ApiProperty({ type: CategoryResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => CategoryResponse)
    subIndicator?: CategoryResponse | null;
}
