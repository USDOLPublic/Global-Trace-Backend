import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { fileNameFromBlob } from '~core/helpers/string.helper';

export class ChangeTypeValueUploadFieldsRecordProductTable1698050686891 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const recordProducts = await queryRunner.query(`SELECT * FROM "RecordProduct" ORDER BY "createdAt" DESC`);

        for (const recordProduct of recordProducts) {
            queryRunner.query(`UPDATE "RecordProduct" SET "uploadProofs" = $1 WHERE "id" = '${recordProduct.id}'`, [
                recordProduct.uploadProofs.length
                    ? `[${this.changeValueUploadField(recordProduct.uploadProofs)}]`
                    : `[]`
            ]);
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
