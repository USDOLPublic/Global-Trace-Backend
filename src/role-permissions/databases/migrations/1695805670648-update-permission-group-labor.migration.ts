import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdatePermissionGroupLabor1695805670648 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `UPDATE "PermissionGroup" SET "name" = 'Labor' WHERE "id" = '0af3c7fe-ec1b-4570-8c1d-40b8773fff6f'`
        );
    }
}
