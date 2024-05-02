import { applyDecorators } from '@nestjs/common';
import { RequireToUploadFile } from '@diginexhk/nestjs-base-decorator';
import { RequireUploadFileType } from '~core/types/require-upload-file.type';
import { getUploadTemplateFileOptions, PROOF_UPLOAD_FILE_OPTIONS } from '~uploads/constants/upload.constant';

export function RequireUploadFile({ fieldName, maxCount = 5 }: RequireUploadFileType) {
    return applyDecorators(RequireToUploadFile({ fieldName, options: { ...PROOF_UPLOAD_FILE_OPTIONS, maxCount } }));
}

export function RequireUploadTemplateFile({
    fieldName,
    maxCount = 1,
    usingMemoryStorage = false
}: RequireUploadFileType) {
    return applyDecorators(
        RequireToUploadFile({
            fieldName,
            options: getUploadTemplateFileOptions(maxCount, usingMemoryStorage)
        })
    );
}
