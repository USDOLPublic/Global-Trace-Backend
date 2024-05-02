import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import SYNC_OAR_COUNTRY_NAME_DATA from '~locations/databases/data/sync-oar-country-name.json';

export class UpdateCountryNameFollowingByOarList1652888168731 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await Promise.all(
            SYNC_OAR_COUNTRY_NAME_DATA.map(({ id, oarCountryName }) =>
                queryRunner.query(`UPDATE "Country" SET "country" = $1 WHERE "id" = $2`, [oarCountryName, id])
            )
        );
    }
}
