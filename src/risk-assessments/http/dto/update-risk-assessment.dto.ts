import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID, ValidateNested } from 'class-validator';
import { Numeric } from '~core/http/validators/numeric.validator';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { MethodologyEnum } from '~risk-assessments/enums/methodology.enum';

export class RoleWeightsDto {
    @ApiProperty()
    @IsUUID()
    roleId: string;

    @ApiPropertyOptional()
    @IsNumber()
    @Numeric(14, 2)
    @IsPositive()
    weight: number | null;
}
export class UpdateRiskAssessmentDto {
    @ApiProperty({ enum: MethodologyEnum, example: MethodologyEnum.WEIGHTED_AVERAGE })
    @IsEnum(MethodologyEnum)
    methodology: MethodologyEnum;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    @Numeric(14, 2)
    @IsPositive()
    geographyWeight: number | null;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    @Numeric(14, 2)
    @IsPositive()
    listOfGoodsWeight: number | null;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    @IsOptional()
    @Numeric(14, 2)
    @IsPositive()
    saqsWeight: number | null;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    @IsOptional()
    @Numeric(14, 2)
    @IsPositive()
    dnaWeight: number | null;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    @IsOptional()
    @Numeric(14, 2)
    @IsPositive()
    hotlineWeight: number | null;

    @ApiProperty({ type: RoleWeightsDto, isArray: true, required: false })
    @IsArray()
    @Type(() => RoleWeightsDto)
    @ValidateNested({ each: true })
    @IsOptional()
    roleWeights: RoleWeightsDto[];
}
