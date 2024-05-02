import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import countries from '../data/countries.json';
import { chunk } from 'lodash';
import format from 'pg-format';

export class InsertCountriesTable1690274398662 extends BaseMigration {
    private chunkLength = 1000;

    async run(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "Country"');

        let chunkData = chunk(countries, this.chunkLength);
        for (const chunkItem of chunkData) {
            const insertData = chunkItem.map((item) => [item.id, item.countryCode, item.country, item.translation]);
            const sql = format(
                'INSERT INTO "Country" ("id", "countryCode", "country", "translation") VALUES %L',
                insertData
            );
            await queryRunner.query(sql);
        }
    }
}
