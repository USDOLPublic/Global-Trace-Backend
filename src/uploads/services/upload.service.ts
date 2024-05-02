import { StorageService } from '@diginexhk/nestjs-storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
    public constructor(private storageService: StorageService) {}

    async uploadFiles(files: Express.Multer.File[]): Promise<{ blobName: string; url: string }[]> {
        return Promise.all(
            files.map(async (file) => {
                const { blobName } = await this.storageService.uploadFile({ file });
                const url = this.storageService.getFileUrl(blobName);
                return { blobName, url };
            })
        );
    }
}
