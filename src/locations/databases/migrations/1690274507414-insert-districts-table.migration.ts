import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import districts from '../data/districts.json';
import { chunk } from 'lodash';
import format from 'pg-format';

export class InsertDistrictsTable1690274507414 extends BaseMigration {
    private chunkLength = 1000;

    async run(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "District"');

        let chunkData = chunk(districts, this.chunkLength);
        for (const chunkItem of chunkData) {
            const insertData = chunkItem.map((item) => [
                item.id,
                item.provinceId,
                item.districtCode,
                item.district,
                item.translation
            ]);
            const sql = format(
                'INSERT INTO "District" ("id", "provinceId", "districtCode", "district", "translation") VALUES %L',
                insertData
            );
            await queryRunner.query(sql);
        }
    }
}
