import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { EventTypeEnum } from '~history/enums/event-type.enum';

export class EventResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsUUID()
    facilityId: string;

    @ApiProperty({ enum: EventTypeEnum })
    @IsEnum(EventTypeEnum)
    type: EventTypeEnum;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    recordedAt: Date | number | null;

    @ApiProperty()
    @IsUUID()
    entityId: string;

    @ApiProperty()
    @IsString()
    entityType: string;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    deletedAt: Date | number | null;
}
