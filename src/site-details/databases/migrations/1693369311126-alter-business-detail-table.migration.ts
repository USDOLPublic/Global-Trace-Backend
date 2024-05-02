import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterBusinessDetailTable1693369311126 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.string('name').nullable();
            table.jsonb('logo').default("'{}'::jsonb");
            table.uuid('countryId').nullable().index().foreign('Country');
        });

        await queryRunner.query(
            `UPDATE "BusinessDetail"
            SET "countryId" = "Country"."id"
            FROM "Country"
            WHERE "BusinessDetail"."country" = "Country"."country"`
        );

        await this.update('BusinessDetail', (table) => {
            table.dropColumn('country');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.string('country').nullable();
        });

        await queryRunner.query(
            `UPDATE "BusinessDetail"
            SET "country" = "Country"."country"
            FROM "Country"
            WHERE "BusinessDetail"."countryId" = "Country"."id"`
        );

        await this.update('BusinessDetail', (table) => {
            table.dropColumn('name');
            table.dropColumn('logo');
            table.dropColumn('countryId');
        });
    }
}
