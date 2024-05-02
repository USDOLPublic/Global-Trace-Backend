import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class SelfAssessmentResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    forFacilityId: string | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704036
    })
    @IsOptional()
    @IsInt()
    completedSaqAt: number | Date | null;
}
