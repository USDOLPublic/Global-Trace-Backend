import { FileUploadOptionsType } from '@diginexhk/nestjs-base-decorator/types/file-upload-options.type';
import { memoryStorage } from 'multer';
import { getMulterOptions } from '@diginexhk/nestjs-base-decorator';

export const FILES_UPLOAD_MAXIMUM = 5;

export const FILE_UPLOAD_MAX_SIZE = 10 * 1024 * 1024;

export const FILE_UPLOAD_DESTINATION = './tmp/proofs';

export const ALLOWED_FILE_UPLOAD_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/bmp',
    'image/heic',
    'image/heif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
];

export const ALLOWED_TEMPLATE_FILE_UPLOAD_MIME_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/json'
];

export const ALLOWED_IMAGE_UPLOAD_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const IMAGE_UPLOAD_OPTIONS = getMulterOptions({
    fileSize: FILE_UPLOAD_MAX_SIZE,
    allowedMimeTypes: ALLOWED_IMAGE_UPLOAD_MIME_TYPES,
    storageEngine: memoryStorage()
});

export const PROOF_LOCAL_OPTIONS = getMulterOptions({
    fileSize: FILE_UPLOAD_MAX_SIZE,
    allowedMimeTypes: ALLOWED_FILE_UPLOAD_MIME_TYPES,
    storageEngine: memoryStorage()
});

export const PROOF_UPLOAD_FILE_OPTIONS: FileUploadOptionsType = {
    maxCount: FILES_UPLOAD_MAXIMUM,
    fileSize: FILE_UPLOAD_MAX_SIZE,
    allowedMimeTypes: ALLOWED_FILE_UPLOAD_MIME_TYPES,
    storageEngine: memoryStorage()
};

export function getUploadTemplateFileOptions(maxCount: number, usingMemoryStorage = false): FileUploadOptionsType {
    return {
        ...PROOF_UPLOAD_FILE_OPTIONS,
        maxCount,
        allowedMimeTypes: ALLOWED_TEMPLATE_FILE_UPLOAD_MIME_TYPES,
        storageEngine: memoryStorage()
    };
}
