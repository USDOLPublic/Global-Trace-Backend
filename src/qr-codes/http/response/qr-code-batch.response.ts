import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class QrCodeBatchResponse {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsNumber()
    createdAt: number;

    @ApiProperty()
    @IsNumber()
    updatedAt: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @IsNumber()
    totalEncoded: number;

    @ApiProperty()
    @IsNumber()
    totalActive: number;

    @ApiProperty()
    @IsNumber()
    totalDispensed: number;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704036
    })
    @IsOptional()
    @IsInt()
    completedAt: Date | number | null;

    @ApiProperty()
    @IsUUID()
    creatorId: string;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704036
    })
    @IsOptional()
    @IsInt()
    deletedAt: number | Date | null;
}
