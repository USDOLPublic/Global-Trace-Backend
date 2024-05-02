import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { QrCodeEntity } from '~qr-codes/entities/qr-code.entity';
import { QrCodeStatusEnum } from '~qr-codes/enums/qr-code-status.enum';
import { ManualAddedProductDto } from './manual-added-product-attribute.dto';

export class OutputProductDto extends ManualAddedProductDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @IsNumberString({}, { message: 'invalid_qr_type' })
    @MaxLength(9, { message: 'invalid_qr_type' })
    @Exists(
        QrCodeEntity,
        'code',
        false,
        [
            {
                column: 'status',
                exclude: false,
                value: QrCodeStatusEnum.ENCODED
            }
        ],
        { message: 'invalid_product_id' }
    )
    qrCode?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    dnaIdentifier?: string | null;
}
