import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddEnTranslationForCategories1699592158158 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "Category"
            SET "translation" = jsonb("translation") || jsonb_build_object('en', "name")
            WHERE "translation"->>'en' IS NULL
        `);
    }
}
