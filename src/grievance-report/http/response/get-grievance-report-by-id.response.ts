import { FacilityResponse } from '~facilities/http/response/facility.response';
import { GrievanceReportResponse } from './grievance-report.response';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserResponse } from '~users/http/response/user.response';
import { GrievanceReportResponseEntityResponse } from './grievance-report-response-entity.response';
import { LaborRiskResponse } from './labor-risk.response';

export class GetGrievanceReportByIdResponse extends GrievanceReportResponse {
    @ApiProperty({ type: FacilityResponse })
    @ValidateNested()
    @Type(() => FacilityResponse)
    facility: FacilityResponse;

    @ApiProperty({ type: UserResponse })
    @ValidateNested()
    @Type(() => UserResponse)
    creator: UserResponse;

    @ApiPropertyOptional({ type: GrievanceReportResponseEntityResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GrievanceReportResponseEntityResponse)
    responses?: GrievanceReportResponseEntityResponse[] | null;

    @ApiProperty({ type: LaborRiskResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LaborRiskResponse)
    laborRisks: LaborRiskResponse[];
}
