import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { UserRoleTypeEnum } from '~role-permissions/enums/user-role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { convertArrToString } from '~core/helpers/convert-arr-to-string';

export class UpdateDefaultRoleType1686215233651 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const productRoles = [
            UserRoleEnum.MILL,
            UserRoleEnum.GINNER,
            UserRoleEnum.SPINNER,
            UserRoleEnum.FARM_GROUP,
            UserRoleEnum.BROKER
        ];

        await queryRunner.query(
            `
            UPDATE "Role"
            SET "type" = '${UserRoleTypeEnum.PRODUCT_TRACING}'
            WHERE "name" IN (${convertArrToString(productRoles)})
            `
        );
    }
}
