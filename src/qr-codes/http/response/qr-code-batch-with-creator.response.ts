import { UserResponse } from '~users/http/response/user.response';
import { QrCodeBatchResponse } from './qr-code-batch.response';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QrCodeBatchWithCreatorResponse extends QrCodeBatchResponse {
    @ApiProperty({ type: UserResponse })
    @ValidateNested()
    @Type(() => UserResponse)
    creator: UserResponse;
}
