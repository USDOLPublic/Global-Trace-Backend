import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { fileNameFromBlob } from '~core/helpers/string.helper';

export class ChangeTypeValueUploadFieldsTransactionTable1698044599821 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const transactions = await queryRunner.query(`SELECT * FROM "Transaction" ORDER BY "createdAt" DESC`);

        for (const transaction of transactions) {
            queryRunner.query(
                `UPDATE "Transaction" SET "uploadProofs" = $1, "uploadInvoices" = $2, "uploadPackingLists" = $3 WHERE "id" = '${transaction.id}'`,
                [
                    transaction.uploadProofs.length
                        ? `[${this.changeValueUploadField(transaction.uploadProofs)}]`
                        : `[]`,
                    transaction.uploadInvoices.length
                        ? `[${this.changeValueUploadField(transaction.uploadInvoices)}]`
                        : `[]`,
                    transaction.uploadPackingLists.length
                        ? `[${this.changeValueUploadField(transaction.uploadPackingLists)}]`
                        : `[]`
                ]
            );
        }
    }

    private changeValueUploadField(uploadFields: string[]) {
        return uploadFields.map((value) => {
            return JSON.stringify({
                blobName: value,
                fileName: `${fileNameFromBlob(value)}`
            });
        });
    }
}
