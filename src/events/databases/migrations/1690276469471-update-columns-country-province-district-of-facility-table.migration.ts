import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateColumnsCountryProvinceDistrictOfFacilityTable1690276469471 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        // Update lot country
        await queryRunner.query(
            `UPDATE "Lot" AS "OrgF"
            SET "country" = "Country"."id"
            FROM "Lot" AS "F"
                LEFT JOIN "Country" ON "F"."country" = "Country"."country"
            WHERE "OrgF"."id" = "F"."id"`
        );

        // Update lot province
        await queryRunner.query(
            `UPDATE "Lot" AS "OrgF"
            SET "province" = "Province"."id"
            FROM "Lot" AS "F"
                LEFT JOIN "Province" ON "F"."country"::uuid = "Province"."countryId" AND "F"."province" = "Province"."province"
            WHERE "OrgF"."id" = "F"."id"`
        );

        // Update lot district
        await queryRunner.query(
            `UPDATE "Lot" AS "OrgF"
            SET "district" = "District"."id"
            FROM "Lot" AS "F"
                LEFT JOIN "District" ON "F"."province"::uuid = "District"."provinceId" AND "F"."district" = "District"."district"
            WHERE "OrgF"."id" = "F"."id"`
        );

        // Update Lot columns
        await queryRunner.query(
            `ALTER TABLE "Lot"
                ALTER "country" TYPE uuid USING (country::uuid),
                ALTER "province" TYPE uuid USING (province::uuid),
                ALTER "district" TYPE uuid USING (district::uuid)`
        );

        await queryRunner.query('ALTER TABLE "Lot" RENAME "country" TO "countryId"');
        await queryRunner.query('ALTER TABLE "Lot" RENAME "province" TO "provinceId"');
        await queryRunner.query('ALTER TABLE "Lot" RENAME "district" TO "districtId"');

        await queryRunner.query('CREATE INDEX "Lot-countryIdIndex" ON "Lot" ("countryId")');
        await queryRunner.query('CREATE INDEX "Lot-provinceIdIndex" ON "Lot" ("provinceId")');
        await queryRunner.query('CREATE INDEX "Lot-districtIdIndex" ON "Lot" ("districtId")');

        await queryRunner.query(
            `ALTER TABLE "Lot"
                ADD CONSTRAINT "fk_Lot_countryId" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON UPDATE CASCADE ON DELETE SET NULL,
                ADD CONSTRAINT "fk_Lot_provinceId" FOREIGN KEY ("provinceId") REFERENCES "Province" ("id") ON UPDATE CASCADE ON DELETE SET NULL,
                ADD CONSTRAINT "fk_Lot_districtId" FOREIGN KEY ("districtId") REFERENCES "District" ("id") ON UPDATE CASCADE ON DELETE SET NULL`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "Lot"
                DROP CONSTRAINT "fk_Lot_countryId",
                DROP CONSTRAINT "fk_Lot_provinceId",
                DROP CONSTRAINT "fk_Lot_districtId"`
        );

        await queryRunner.query('DROP INDEX IF EXISTS "Lot-countryIdIndex"');
        await queryRunner.query('DROP INDEX IF EXISTS "Lot-provinceIdIndex"');
        await queryRunner.query('DROP INDEX IF EXISTS "Lot-districtIdIndex"');

        // Update Lot columns
        await queryRunner.query(
            `ALTER TABLE "Lot"
                ALTER "countryId" TYPE character varying(255),
                ALTER "provinceId" TYPE character varying(255),
                ALTER "districtId" TYPE character varying(255)`
        );

        await queryRunner.query('ALTER TABLE "Lot" RENAME "countryId" TO "country"');
        await queryRunner.query('ALTER TABLE "Lot" RENAME "provinceId" TO "province"');
        await queryRunner.query('ALTER TABLE "Lot" RENAME "districtId" TO "district"');

        // Update lot country
        await queryRunner.query(
            `UPDATE "Lot"
            SET "country" = "Country"."country"
            FROM "Country"
            WHERE "Lot"."country"::uuid = "Country"."id"`
        );

        // Update lot province
        await queryRunner.query(
            `UPDATE "Lot"
            SET "province" = "Province"."province"
            FROM "Province"
            WHERE "Lot"."province"::uuid = "Province"."id"`
        );

        // Update lot district
        await queryRunner.query(
            `UPDATE "Lot"
            SET "district" = "District"."district"
            FROM "District"
            WHERE "Lot"."district"::uuid = "District"."id"`
        );
    }
}
