import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { IncidentReportStatus } from '~grievance-report/enums/incident-report-status.enum';
import { ReasonEnum } from '~grievance-report/enums/reason.enum';

export class GrievanceReportResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    facilityId: string | null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    assigneeId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    creatorId: string | null;

    @ApiPropertyOptional({
        enum: ReasonEnum
    })
    @IsOptional()
    @IsEnum(ReasonEnum)
    reason: ReasonEnum | null;

    @ApiPropertyOptional({
        enum: IncidentReportStatus
    })
    @IsOptional()
    @IsEnum(IncidentReportStatus)
    status: IncidentReportStatus;

    @ApiProperty()
    @IsBoolean()
    isNoFollowUp: boolean;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    recordedAt: Date | number | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    latestActivityAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    uploadFiles: any;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    priority: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    auditReportNumber?: string;
}
