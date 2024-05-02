import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { QrCodeStatusEnum } from '~qr-codes/enums/qr-code-status.enum';

export class QrCodeResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsUUID()
    qrCodeBatchId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ enum: QrCodeStatusEnum })
    @IsEnum(QrCodeStatusEnum)
    status: QrCodeStatusEnum;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704036
    })
    @IsOptional()
    @IsInt()
    deletedAt: number | Date | null;
}
