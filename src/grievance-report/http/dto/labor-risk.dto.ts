import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { CategoryEntity } from '~categories/entities/category.entity';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { Exists } from '~core/http/validators/exists.validator';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';

export class LaborRiskDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(CategoryEntity, 'id', false, [{ column: 'type', exclude: false, value: CategoryTypeEnum.INDICATOR }])
    indicatorId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(CategoryEntity, 'id', false, [{ column: 'type', exclude: false, value: CategoryTypeEnum.SUB_INDICATOR }])
    subIndicatorId: string;

    @ApiProperty({ enum: SeverityEnum, example: SeverityEnum.HIGH })
    @IsEnum(SeverityEnum)
    severity: SeverityEnum;
}
