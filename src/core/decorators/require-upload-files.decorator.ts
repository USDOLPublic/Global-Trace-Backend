import { applyDecorators } from '@nestjs/common';
import { RequireToUploadFiles } from '@diginexhk/nestjs-base-decorator';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { PROOF_UPLOAD_FILE_OPTIONS } from '~uploads/constants/upload.constant';

export function RequireUploadFiles(fieldNames: MulterField[]) {
    return applyDecorators(RequireToUploadFiles({ fieldNames, options: PROOF_UPLOAD_FILE_OPTIONS }));
}
