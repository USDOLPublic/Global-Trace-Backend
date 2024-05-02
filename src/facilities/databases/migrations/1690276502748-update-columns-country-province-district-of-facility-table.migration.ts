import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateColumnsCountryProvinceDistrictOfFacilityTable1690276502748 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        // Update facility country
        await queryRunner.query(
            `UPDATE "Facility" AS "OrgF"
            SET "country" = "Country"."id"
            FROM "Facility" AS "F"
                LEFT JOIN "Country" ON "F"."country" = "Country"."country"
            WHERE "OrgF"."id" = "F"."id"`
        );

        // Update facility province
        await queryRunner.query(
            `UPDATE "Facility" AS "OrgF"
            SET "province" = "Province"."id"
            FROM "Facility" AS "F"
                LEFT JOIN "Province" ON "F"."country"::uuid = "Province"."countryId" AND "F"."province" = "Province"."province"
            WHERE "OrgF"."id" = "F"."id"`
        );

        // Update facility district
        await queryRunner.query(
            `UPDATE "Facility" AS "OrgF"
            SET "district" = "District"."id"
            FROM "Facility" AS "F"
                LEFT JOIN "District" ON "F"."province"::uuid = "District"."provinceId" AND "F"."district" = "District"."district"
            WHERE "OrgF"."id" = "F"."id"`
        );

        // Update Facility columns
        await queryRunner.query(
            `ALTER TABLE "Facility"
                ALTER "country" TYPE uuid USING (country::uuid),
                ALTER "province" TYPE uuid USING (province::uuid),
                ALTER "district" TYPE uuid USING (district::uuid)`
        );

        await queryRunner.query('ALTER TABLE "Facility" RENAME "country" TO "countryId"');
        await queryRunner.query('ALTER TABLE "Facility" RENAME "province" TO "provinceId"');
        await queryRunner.query('ALTER TABLE "Facility" RENAME "district" TO "districtId"');

        await queryRunner.query('CREATE INDEX "Facility-countryIdIndex" ON "Facility" ("countryId")');
        await queryRunner.query('CREATE INDEX "Facility-provinceIdIndex" ON "Facility" ("provinceId")');
        await queryRunner.query('CREATE INDEX "Facility-districtIdIndex" ON "Facility" ("districtId")');

        await queryRunner.query(
            `ALTER TABLE "Facility"
                ADD CONSTRAINT "fk_Facility_countryId" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON UPDATE CASCADE ON DELETE SET NULL,
                ADD CONSTRAINT "fk_Facility_provinceId" FOREIGN KEY ("provinceId") REFERENCES "Province" ("id") ON UPDATE CASCADE ON DELETE SET NULL,
                ADD CONSTRAINT "fk_Facility_districtId" FOREIGN KEY ("districtId") REFERENCES "District" ("id") ON UPDATE CASCADE ON DELETE SET NULL`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "Facility"
                DROP CONSTRAINT "fk_Facility_countryId",
                DROP CONSTRAINT "fk_Facility_provinceId",
                DROP CONSTRAINT "fk_Facility_districtId"`
        );

        await queryRunner.query('DROP INDEX IF EXISTS "Facility-countryIdIndex"');
        await queryRunner.query('DROP INDEX IF EXISTS "Facility-provinceIdIndex"');
        await queryRunner.query('DROP INDEX IF EXISTS "Facility-districtIdIndex"');

        // Update Facility columns
        await queryRunner.query(
            `ALTER TABLE "Facility"
                ALTER "countryId" TYPE character varying(255),
                ALTER "provinceId" TYPE character varying(255),
                ALTER "districtId" TYPE character varying(255)`
        );

        await queryRunner.query('ALTER TABLE "Facility" RENAME "countryId" TO "country"');
        await queryRunner.query('ALTER TABLE "Facility" RENAME "provinceId" TO "province"');
        await queryRunner.query('ALTER TABLE "Facility" RENAME "districtId" TO "district"');

        // Update facility country
        await queryRunner.query(
            `UPDATE "Facility"
            SET "country" = "Country"."country"
            FROM "Country"
            WHERE "Facility"."country"::uuid = "Country"."id"`
        );

        // Update facility province
        await queryRunner.query(
            `UPDATE "Facility"
            SET "province" = "Province"."province"
            FROM "Province"
            WHERE "Facility"."province"::uuid = "Province"."id"`
        );

        // Update facility district
        await queryRunner.query(
            `UPDATE "Facility"
            SET "district" = "District"."district"
            FROM "District"
            WHERE "Facility"."district"::uuid = "District"."id"`
        );
    }
}
