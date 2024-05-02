import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { RoleResponse } from '~role-permissions/http/response/role.response';

export class FacilityPartnerResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    facilityId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    partnerId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    creatorId: string | null;

    @ApiPropertyOptional({ type: RoleResponse })
    @IsOptional()
    @ValidateNested()
    @Type(() => RoleResponse)
    type: RoleResponse | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    ownerFacilityId: string | null;
}
