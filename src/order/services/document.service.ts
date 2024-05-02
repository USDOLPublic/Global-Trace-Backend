import { StorageService } from '@diginexhk/nestjs-storage';
import { Injectable, StreamableFile } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { Response } from 'express';
import { get } from 'lodash';
import { setHeaderDownloadZipFile } from '~core/helpers/zip-file.helper';
import { FileUploadType } from '~core/types/file-upload.type';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionHistoryService } from '~events/services/transaction/transaction-history.service';
import { getFileName } from '~history/helpers/download-file-name.helper';

@Injectable()
export class DocumentService {
    constructor(private transactionHistoryService: TransactionHistoryService, private storageService: StorageService) {}

    async downloadDocuments(transactionIds: string[], res: Response) {
        const transactions = await this.transactionHistoryService.getRawTransactionsByIds(transactionIds);

        const zip = new AdmZip();
        const existingFiles: string[] = [];

        await this.addDocumentToZip(zip, transactions, 'certifications', existingFiles);
        await this.addDocumentToZip(zip, transactions, 'uploadProofs', existingFiles);
        await this.addDocumentToZip(zip, transactions, 'uploadInvoices', existingFiles);
        await this.addDocumentToZip(zip, transactions, 'uploadPackingLists', existingFiles);

        setHeaderDownloadZipFile(res, 'documents');
        return new StreamableFile(zip.toBuffer()).getStream().pipe(res);
    }

    private async addDocumentToZip(
        zip: AdmZip,
        transactions: TransactionEntity[],
        type: string,
        existingFiles: string[]
    ) {
        const files: FileUploadType[] = transactions.reduce((previousValue, transaction) => {
            const addingFiles: FileUploadType[] = get(transaction, type, []);

            if (!addingFiles.length) return previousValue;

            addingFiles.forEach((addingFile) => {
                if (!previousValue.filter((file) => file.blobName === addingFile.blobName).length) {
                    previousValue.push(addingFile);
                }
            });
            return previousValue;
        }, []);

        if (!files.length) {
            return;
        }

        const directory = this.getDirectory(type);

        for (const file of files) {
            const fileName = getFileName(existingFiles, `${directory}/${file.fileName}`);
            const buffer = await this.storageService.getFileBuffer(file.blobName);
            zip.addFile(fileName, buffer);
        }
    }

    private getDirectory(type: string) {
        if (type === 'uploadProofs' || type === 'certifications') {
            return 'purchaseProofs';
        } else if (type === 'uploadInvoices') {
            return 'invoices';
        } else if (type === 'uploadPackingLists') {
            return 'packing-lists';
        }
    }
}
