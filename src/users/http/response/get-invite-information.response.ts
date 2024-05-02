import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PermissionResponse } from '~role-permissions/http/response/permission.response';
import { RoleWithPermissionsResponse } from '~role-permissions/http/response/role-with-permissions.response';

export class GetInviteInformationResponse {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsNumber()
    createdAt: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ type: RoleWithPermissionsResponse })
    @ValidateNested()
    @Type(() => RoleWithPermissionsResponse)
    role: RoleWithPermissionsResponse;

    @ApiProperty({ type: PermissionResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionResponse)
    permissions: PermissionResponse[];
}
