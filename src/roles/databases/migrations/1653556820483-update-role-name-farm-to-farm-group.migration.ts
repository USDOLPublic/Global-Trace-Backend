import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';

export class UpdateRoleNameFarmToFarmGroup1653556820483 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`UPDATE "Role" SET "name" = $1 WHERE "name" = 'FARM'`, [UserRoleEnum.FARM_GROUP]);
    }
}
