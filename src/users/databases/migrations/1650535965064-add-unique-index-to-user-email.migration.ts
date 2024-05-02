import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddUniqueIndexToUserEmail1650535965064 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('DROP INDEX IF EXISTS "User-emailIndex"');
        await queryRunner.query(
            'CREATE UNIQUE INDEX "User_Unique_Index_email" ON "User" ("email") WHERE ("deletedAt" IS NULL);'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query('DROP INDEX IF EXISTS "User_Unique_Index_email"');
        await queryRunner.query('CREATE INDEX "User-emailIndex" ON "User" ("email")');
    }
}
