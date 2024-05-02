import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class TransformationResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    facilityId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    uploadCertifications: any;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    creatorId: string | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    deletedAt: number | Date | null;
}
