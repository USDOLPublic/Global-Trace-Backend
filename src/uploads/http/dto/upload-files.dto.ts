import { ApiProperty } from '@nestjs/swagger';

export class UploadFilesDto {
    @ApiProperty({ type: 'string', format: 'binary', isArray: true })
    files: string[];
}
