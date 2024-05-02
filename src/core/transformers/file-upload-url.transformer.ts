import { ValueTransformer } from 'typeorm';
import { StorageService } from '@diginexhk/nestjs-storage';
import { isArray, isObject, isString } from 'lodash';
import { FileUploadType } from '~core/types/file-upload.type';

export class FileUploadUrlTransformer implements ValueTransformer {
    to(value) {
        return value;
    }

    from(value: string | string[] | null | FileUploadType[] | FileUploadType) {
        if (isArray(value)) {
            return value.map((proof) => {
                if (!Object.keys(value).length) return null;

                return {
                    link: StorageService.instance.getFileUrl(proof.blobName),
                    fileName: proof.fileName,
                    blobName: proof.blobName
                };
            });
        } else if (isObject(value)) {
            if (!Object.keys(value).length) return null;

            return {
                link: StorageService.instance.getFileUrl((value as FileUploadType).blobName),
                fileName: (value as FileUploadType).fileName,
                blobName: (value as FileUploadType).blobName
            };
        } else if (isString(value)) {
            return StorageService.instance.getFileUrl(value);
        }

        return null;
    }
}
