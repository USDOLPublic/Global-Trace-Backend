import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import provinces from '../data/provinces.json';
import { chunk } from 'lodash';
import format from 'pg-format';

export class InsertProvincesTable1690274469860 extends BaseMigration {
    private chunkLength = 1000;

    async run(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "Province"');

        let chunkData = chunk(provinces, this.chunkLength);
        for (const chunkItem of chunkData) {
            const insertData = chunkItem.map((item) => [
                item.id,
                item.countryId,
                item.provinceCode,
                item.province,
                item.translation
            ]);
            const sql = format(
                'INSERT INTO "Province" ("id", "countryId", "provinceCode", "province", "translation") VALUES %L',
                insertData
            );
            await queryRunner.query(sql);
        }
    }
}
