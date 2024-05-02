import { ApiProperty } from '@nestjs/swagger';
import { QrCodeBatchWithCreatorResponse } from './qr-code-batch-with-creator.response';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationResponse } from '~core/http/response/pagination.response';

export class QrCodeBatchPaginationResponse extends PaginationResponse {
    @ApiProperty({ type: QrCodeBatchWithCreatorResponse })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QrCodeBatchWithCreatorResponse)
    items: QrCodeBatchWithCreatorResponse[];
}
