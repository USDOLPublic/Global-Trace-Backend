import { ApiProperty } from '@nestjs/swagger';

export class UploadProductTranslationFileDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: Express.Multer.File;
}
