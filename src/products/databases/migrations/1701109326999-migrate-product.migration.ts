import { BaseMigration } from '@diginexhk/typeorm-helper';
import fs from 'fs';
import path from 'path';
import { QueryRunner } from 'typeorm';
import { env } from '~config/env.config';

export class MigrateProduct1701109326999 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const migrationQuery = fs
            .readFileSync(path.join(env.ROOT_PATH, 'products/databases/sql/migrate-product.sql'))
            .toString();

        await queryRunner.query(migrationQuery);
    }
}
