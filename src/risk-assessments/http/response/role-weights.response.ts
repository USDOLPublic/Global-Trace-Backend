import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class RoleWeightsResponse {
    @ApiProperty()
    @IsUUID()
    roleId: string;

    @ApiPropertyOptional()
    @IsNumber()
    weight: number | null;
}
