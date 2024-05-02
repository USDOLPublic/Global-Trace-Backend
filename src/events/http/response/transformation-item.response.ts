import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';

export class TransformationItemResponse extends BaseEntityResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    transformationId: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    entityId: string;

    @ApiProperty()
    @IsBoolean()
    isInput: boolean;
}
