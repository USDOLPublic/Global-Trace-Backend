import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import Geographycal from '~self-assessments/databases/data/geographical.json';
import { first } from 'lodash';

export class ImportDataToGeographicalRiskLevelTable1698743682881 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        for (const record of Geographycal) {
            const country: { id: string } = first(
                await queryRunner.query(`SELECT * FROM "Country" WHERE "country" = $1`, [record.country])
            );
            if (country) {
                await queryRunner.query(`INSERT INTO "GeographicalRiskLevel" ("countryId", "risk") VALUES ($1, $2)`, [
                    country.id,
                    record.risk
                ]);
            }
        }
    }
}
