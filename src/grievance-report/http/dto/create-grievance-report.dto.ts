import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsString,
    IsUUID,
    MaxLength,
    IsBoolean,
    IsNumber,
    Min,
    Max,
    IsArray,
    ValidateNested,
    IsOptional
} from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ReasonEnum } from '~grievance-report/enums/reason.enum';
import { UserEntity } from '~users/entities/user.entity';
import { LaborRiskDto } from './labor-risk.dto';
import { Type } from 'class-transformer';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';

export class CreateGrievanceReportDto {
    @ApiProperty()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id', false, [])
    facilityId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    priority: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ type: LaborRiskDto, isArray: true })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LaborRiskDto)
    laborRisks: LaborRiskDto[];

    @ApiProperty()
    @IsOptional()
    @IsUUID('4')
    @Exists(UserEntity, 'id')
    assigneeId: string;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @IsNotEmpty()
    isNoFollowUp: boolean;

    @ApiProperty({ enum: ReasonEnum })
    @ValidateIfOrExclude((obj) => obj.isNoFollowUp === false)
    @IsEnum(ReasonEnum)
    @IsNotEmpty()
    reason: ReasonEnum;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    message: string;
}
