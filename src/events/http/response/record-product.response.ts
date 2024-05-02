import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { FileUploadType } from '~core/types/file-upload.type';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';

export class RecordProductResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsNumber()
    totalWeight: number;

    @ApiProperty({ enum: WeightUnitEnum })
    @IsEnum(WeightUnitEnum)
    weightUnit: WeightUnitEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    facilityId: string | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    recordedAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    uploadProofs: FileUploadType[];
}
