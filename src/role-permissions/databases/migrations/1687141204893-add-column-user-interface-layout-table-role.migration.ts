import { BaseMigration } from '@diginexhk/typeorm-helper';
import { QueryRunner } from 'typeorm';
import { convertArrToString } from '~core/helpers/convert-arr-to-string';
import { UserInterfaceLayoutEnum } from '~role-permissions/enums/user-interface-layout.enum';

export class AddColumnUserInterfaceLayoutTableRole1687141204893 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.string('userInterfaceLayout').nullable();
            table.dropColumn('type');
        });

        await this.updateRoleUserInterfaceLayout(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.string('type').nullable();
            table.dropColumn('userInterfaceLayout');
        });
    }

    private async updateRoleUserInterfaceLayout(queryRunner: QueryRunner) {
        const threePanelRoles = ['GINNER', 'SPINNER', 'MILL'];
        const twoPanelRoles = ['AUDITOR', 'FARM_MONITOR', 'FARM_MONITOR_WEB'];
        const horizontalMenuRoles = ['SUPER_ADMIN', 'ADMIN', 'BRAND'];

        await queryRunner.query(`
            UPDATE "Role"
            SET "userInterfaceLayout" = '${UserInterfaceLayoutEnum.THREE_PANEL_LAYOUT}'
            WHERE "name" IN (${convertArrToString(threePanelRoles)});

            UPDATE "Role"
            SET "userInterfaceLayout" = '${UserInterfaceLayoutEnum.TWO_PANEL_LAYOUT_SLIDE_OUT}'
            WHERE "name" IN (${convertArrToString(twoPanelRoles)});

            UPDATE "Role"
            SET "userInterfaceLayout" = '${UserInterfaceLayoutEnum.HORIZONTAL_MENU}'
            WHERE "name" IN (${convertArrToString(horizontalMenuRoles)});
        `);
    }
}
