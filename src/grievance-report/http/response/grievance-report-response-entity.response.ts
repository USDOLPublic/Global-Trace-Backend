import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { LaborRiskResponse } from './labor-risk.response';
import { Type } from 'class-transformer';

export class GrievanceReportResponseEntityResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsUUID()
    grievanceReportId: string;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    recordedAt: number | Date | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    priority: number | null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiPropertyOptional({ type: String, isArray: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    uploadImages: string[] | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    auditReportNumber: string | null;

    @ApiPropertyOptional({ type: LaborRiskResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LaborRiskResponse)
    laborRisks: LaborRiskResponse[];
}
