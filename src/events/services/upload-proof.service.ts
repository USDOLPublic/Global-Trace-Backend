import { Injectable } from '@nestjs/common';
import { StorageService } from '@diginexhk/nestjs-storage';

@Injectable()
export class UploadProofService {
    constructor(private storageService: StorageService) {}

    uploadProofs(uploadProofs: Array<Express.Multer.File>) {
        return Promise.all(
            uploadProofs.map(async (uploadProof) => {
                const { blobName } = await this.storageService.uploadFile({ file: uploadProof });
                return {
                    fileName: uploadProof.originalname,
                    blobName: blobName
                };
            })
        );
    }
}
