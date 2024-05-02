import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { GrievanceReportResponseEntityResponse } from '~grievance-report/http/response/grievance-report-response-entity.response';
import { GrievanceReportResponse } from '~grievance-report/http/response/grievance-report.response';
import { LaborRiskResponse } from './labor-risk.response';

export class GrievanceReportWithResponsesResponse extends GrievanceReportResponse {
    @ApiPropertyOptional({ type: GrievanceReportResponseEntityResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GrievanceReportResponseEntityResponse)
    responses: GrievanceReportResponseEntityResponse[] | null;

    @ApiPropertyOptional({ type: LaborRiskResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LaborRiskResponse)
    laborRisks: LaborRiskResponse[];
}
