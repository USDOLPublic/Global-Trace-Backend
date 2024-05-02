import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import SYNC_OAR_COUNTRY_NAME_DATA from '~locations/databases/data/sync-oar-country-name.json';

export class UpdateFacilityCountryNameLocationFollowingByOarCountryName1652889501126 extends BaseMigration {
    private updateFacilityLocation(queryRunner: QueryRunner, oldCountry: string, newCountry: string) {
        return queryRunner.query(`UPDATE "Facility" SET "country" = $1 WHERE "country" = $2`, [newCountry, oldCountry]);
    }

    private updateLotLocation(queryRunner: QueryRunner, oldCountry: string, newCountry: string) {
        return queryRunner.query(`UPDATE "Lot" SET "country" = $1 WHERE "country" = $2`, [newCountry, oldCountry]);
    }

    async run(queryRunner: QueryRunner) {
        for (const { country, oarCountryName } of SYNC_OAR_COUNTRY_NAME_DATA) {
            await Promise.all([
                this.updateFacilityLocation(queryRunner, country, oarCountryName),
                this.updateLotLocation(queryRunner, country, oarCountryName)
            ]);
        }
    }
}
