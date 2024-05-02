import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RoleMapNodeResponse } from './role-map-node.response';

export class RoleMapResponse {
    @ApiProperty({ type: RoleMapNodeResponse, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoleMapNodeResponse)
    nodes: RoleMapNodeResponse[];

    @ApiProperty({ isArray: true })
    @IsArray({ each: true })
    lines: string[][];
}
