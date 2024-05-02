import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsEnum, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';
import { CertificationEnum } from '~facilities/enums/certification.enum';
import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { FacilityAdditionalInformationType } from '~facilities/types/facility-additional-information.type';
import { CountryResponse } from '~locations/http/response/country.response';
import { DistrictResponse } from '~locations/http/response/district.response';
import { ProvinceResponse } from '~locations/http/response/province.response';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleResponse } from '~role-permissions/http/response/role.response';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';
import { UserResponse } from '~users/http/response/user.response';
import { FacilityRiskResponse } from './facility-risk.response';

export class FacilityResponse extends BaseEntityResponse {
    @ApiPropertyOptional({
        type: RoleResponse
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => RoleResponse)
    type: RoleResponse | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    typeId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    districtId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    provinceId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    countryId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traderName: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    oarId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    businessRegisterNumber: string | null;

    @ApiPropertyOptional({
        enum: ChainOfCustodyEnum
    })
    @IsOptional()
    @IsEnum(ChainOfCustodyEnum)
    chainOfCustody: ChainOfCustodyEnum | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    certification: CertificationEnum | FarmCertificationEnum | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    goods: string[];

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    reconciliationStartAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    reconciliationDuration: string | null;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    deletedAt: Date | number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    logo: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    // @IsNumber()
    overallRiskScore: number | null;

    @ApiPropertyOptional({
        enum: RiskScoreLevelEnum
    })
    @IsOptional()
    @IsEnum(RiskScoreLevelEnum)
    overallRiskLevel: RiskScoreLevelEnum;

    @ApiPropertyOptional({
        enum: AdditionalRoleEnum
    })
    @IsOptional()
    @IsEnum(AdditionalRoleEnum)
    additionalRole: AdditionalRoleEnum;

    @ApiPropertyOptional({ type: CountryResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => CountryResponse)
    country: CountryResponse | null;

    @ApiPropertyOptional({ type: ProvinceResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => ProvinceResponse)
    province: ProvinceResponse | null;

    @ApiPropertyOptional({ type: DistrictResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => DistrictResponse)
    district: DistrictResponse | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    facilityGroupFileId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    farmId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    farmGroupId: string | null;

    @ApiPropertyOptional({ type: FacilityResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityResponse)
    farmGroup: FacilityResponse;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDefined()
    additionalInformation?: FacilityAdditionalInformationType;

    @ApiPropertyOptional({ type: FacilityRiskResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityRiskResponse)
    riskData: FacilityRiskResponse | null;

    @ApiPropertyOptional({ type: UserResponse, isArray: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResponse)
    users?: UserResponse[] | null;
}
