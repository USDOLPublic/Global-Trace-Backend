import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    IsUUID,
    ValidateNested,
    IsArray,
    Min,
    Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import moment from 'moment';
import { IsTimestamp } from '~core/http/validators/is-timestamp.validator';
import { Exists } from '~core/http/validators/exists.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { LaborRiskDto } from './labor-risk.dto';

export class CreateCommunityRiskScanReportDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    @Exists(FacilityEntity, 'id')
    facilityId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    location: string;

    @ApiProperty({ type: 'timestamp', default: moment().unix() })
    @IsNotEmpty()
    @IsNumber()
    @IsTimestamp()
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
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    message: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    auditReportNumber?: string;

    @ApiProperty({ required: false, isArray: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    uploadFiles?: string[];
}
