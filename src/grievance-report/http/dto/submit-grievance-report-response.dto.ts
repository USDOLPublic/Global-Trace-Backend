import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateNested
} from 'class-validator';
import moment from 'moment';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { RequestDto } from '~core/http/dto/request.dto';
import { IsSameOrBeforeCurrentDate } from '~core/http/validators/is-same-or-before-current-date.validator';
import { LaborRiskDto } from './labor-risk.dto';

export class SubmitGrievanceReportResponseDto extends RequestDto {
    @ApiProperty({ type: 'timestamp', default: moment().unix() })
    @Transform((params) => Number(params.value))
    @IsNumber()
    @IsTimestamp()
    @IsSameOrBeforeCurrentDate()
    recordedAt: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    priority: number;

    @ApiProperty({ type: LaborRiskDto, isArray: true })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LaborRiskDto)
    laborRisks: LaborRiskDto[];

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    message: string;

    @ApiProperty({ required: false, isArray: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    uploadImages?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    auditReportNumber?: string;
}
