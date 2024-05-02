import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';

export class UpdateUserTypeForSupplierUser1649212078249 extends BaseMigration {
    private queryRunnerVar;
    private suppliers;
    private supplierRoleId = '508b03d6-9ca5-4a8f-b4d9-f7cbf69e8768';

    async run(queryRunner: QueryRunner) {
        this.queryRunnerVar = queryRunner;
        this.suppliers = await queryRunner.query(
            `
                SELECT "u"."id", "r"."id" as "roleId", "r"."name" as "roleName", "f"."type" as "facilityType"
                    FROM "User" as u
                        INNER JOIN "UserHasRole" as "uhr" ON "u"."id" = "uhr"."userId"
                        INNER JOIN "Role" as "r" ON "uhr"."roleId" = "r"."id"
                        INNER JOIN "FacilityUser" as "fu" ON "u"."id" = "fu"."userId"
                        INNER JOIN "Facility" as "f" ON "f"."id" = "fu"."facilityId"
                WHERE "r"."id" = $1;
        `,
            [this.supplierRoleId]
        );

        if (this.suppliers.length) {
            await this.updateIsSupplierColumnValue();
            await this.updateUserType();
        }

        await this.removeSupplierRole();
    }

    private updateIsSupplierColumnValue() {
        const supplierIds = this.suppliers.map(({ id }) => id);
        const query = format('UPDATE "User" SET "isSupplier" = true WHERE "id" IN (%L)', supplierIds);
        return this.queryRunnerVar.query(query);
    }

    private updateUserType() {
        const ginnerRoleId = 'e6be1a55-26f0-4fc9-ac27-6cc51f0dc0e5';
        const spinnerRoleId = '0dc62cd0-2539-452c-9050-0110feed9060';
        const millRoleId = '5e429ca1-1a7f-42dc-b9f8-733caded03fe';
        let updateUserTypeSql = '';
        for (const supplier of this.suppliers) {
            if (supplier.facilityType === 2) {
                updateUserTypeSql += `UPDATE "UserHasRole" SET "roleId" = '${ginnerRoleId}' WHERE "userId" = '${supplier.id}';`;
            } else if (supplier.facilityType === 3) {
                updateUserTypeSql += `UPDATE "UserHasRole" SET "roleId" = '${spinnerRoleId}' WHERE "userId" = '${supplier.id}';`;
            } else {
                updateUserTypeSql += `UPDATE "UserHasRole" SET "roleId" = '${millRoleId}' WHERE "userId" = '${supplier.id}';`;
            }
        }

        return this.queryRunnerVar.query(updateUserTypeSql);
    }

    private removeSupplierRole() {
        return this.queryRunnerVar.query(`DELETE FROM "Role" WHERE "id" = $1`, [this.supplierRoleId]);
    }
}
