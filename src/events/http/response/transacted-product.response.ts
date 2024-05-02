import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { ProductDefinitionResponse } from '~product-definitions/http/response/product-definition.response';
import { ProductResponse } from '~products/http/response/product.response';
import { QrCodeResponse } from '~qr-codes/http/response/qr-code.response';

export class TransactedProductResponse extends ProductResponse {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isHavingCertification: boolean | null;

    @ApiProperty({ type: ProductDefinitionResponse })
    @ValidateNested()
    @Type(() => ProductDefinitionResponse)
    productDefinition: ProductDefinitionResponse;

    @ApiPropertyOptional({ type: QrCodeResponse })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => QrCodeResponse)
    qrCode: QrCodeResponse | null;
}
