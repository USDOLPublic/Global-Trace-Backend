import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested
} from 'class-validator';
import { StatusDnaTestingEnum } from '~dna-testing/enums/status-dna-testing.enum';
import { DnaTestProofUploadTypeResponse } from './dna-testing-proof-upload-type.response';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class DnaTestingResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsUUID()
    requestFacilityId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty()
    @IsUUID()
    productSupplierId: string;

    @ApiProperty()
    @IsBoolean()
    isDetected: boolean;

    @ApiProperty({ isArray: true })
    @IsArray()
    @IsString({ each: true })
    dnaIdentifiers: string[];

    @ApiPropertyOptional({
        enum: StatusDnaTestingEnum
    })
    @IsOptional()
    @IsEnum(StatusDnaTestingEnum)
    status: StatusDnaTestingEnum | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    testedAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DnaTestProofUploadTypeResponse)
    uploadProofs: DnaTestProofUploadTypeResponse[] | null;
}
