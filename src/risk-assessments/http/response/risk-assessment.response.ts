import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { MethodologyEnum } from '~risk-assessments/enums/methodology.enum';
import { Type } from 'class-transformer';
import { RoleWeightsResponse } from './role-weights.response';

export class RiskAssessmentResponse extends BaseEntityResponse {
    @ApiProperty({ enum: MethodologyEnum, example: MethodologyEnum.WEIGHTED_AVERAGE })
    @IsEnum(MethodologyEnum)
    methodology: MethodologyEnum;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    geographyWeight: number | null;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    listOfGoodsWeight: number | null;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    saqsWeight: number | null;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    dnaWeight: number | null;

    @ApiPropertyOptional()
    @ValidateIfOrExclude(({ methodology }) => methodology === MethodologyEnum.WEIGHTED_AVERAGE)
    @IsNumber()
    hotlineWeight: number | null;

    @ApiProperty({ type: RoleWeightsResponse })
    @IsArray()
    @Type(() => RoleWeightsResponse)
    @ValidateNested({ each: true })
    @IsOptional()
    roleWeights: RoleWeightsResponse[];
}
