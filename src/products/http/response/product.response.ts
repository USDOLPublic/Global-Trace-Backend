import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { ProductCertificationResponse } from './product-certification.response';

export class ProductResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsUUID()
    productDefinitionId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    code: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    dnaIdentifier: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    verifiedPercentage: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    notVerifiedPercentage: number | null;

    @ApiProperty()
    @IsBoolean()
    isPurchased: boolean;

    @ApiProperty()
    @IsBoolean()
    isSold: boolean;

    @ApiProperty()
    @IsBoolean()
    isTransformed: boolean;

    @ApiProperty()
    @IsBoolean()
    isTransported: boolean;

    @ApiProperty()
    @IsBoolean()
    isManualAdded: boolean;

    @ApiProperty()
    @IsArray()
    additionalAttributes: { attributeId: string; value: any }[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    createdFacilityId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductCertificationResponse)
    certifications: ProductCertificationResponse[] | null;

    @ApiProperty()
    @IsNumber()
    quantity: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    quantityUnit?: string;
}
