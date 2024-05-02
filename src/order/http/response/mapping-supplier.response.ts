import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { FacilityRiskResponse } from '~facilities/http/response/facility-risk.response';
import { RoleResponse } from '~role-permissions/http/response/role.response';

export class MappingSupplierResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ type: RoleResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => RoleResponse)
    type?: RoleResponse;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    orderSupplierId: string;

    @ApiProperty()
    @IsBoolean()
    isRoot: boolean;

    @ApiProperty()
    @IsOptional()
    @IsString()
    label?: string;

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    targets: string[];

    @ApiPropertyOptional({ type: FacilityRiskResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => FacilityRiskResponse)
    riskData?: FacilityRiskResponse | null;
}
