import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';
import { QueryRunner } from 'typeorm';

export class AddColumnChainOfCustonyTableRole1693193496497 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.string('type').nullable();
            table.string('chainOfCustody').nullable();
            table.boolean('isHidden').default(false);
            table.dropColumn('userInterfaces');
            table.dropColumn('userInterfaceLayout');
        });

        await queryRunner.query(
            `UPDATE "Role" SET "isHidden" = true WHERE "name" IN ('SUPER_ADMIN', 'BROKER', 'TRANSPORTER')`
        );
        await this.updateRoleTypeAndChainOfCustody(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.dropColumn('type');
            table.dropColumn('chainOfCustody');
            table.jsonb('userInterfaces').nullable();
            table.string('userInterfaceLayout').nullable();
        });
    }

    private async updateRoleTypeAndChainOfCustody(queryRunner: QueryRunner) {
        const roleType = {
            Product: ['FARM', 'GINNER', 'SPINNER', 'MILL', 'BROKER', 'FINAL_PRODUCT_ASSEMBLY', 'TRANSPORTER'],
            Brand: ['BRAND'],
            Labor: ['AUDITOR', 'FARM_MONITOR', 'FARM_MONITOR_WEB'],
            Administrator: ['SUPER_ADMIN', 'ADMIN']
        };

        Object.entries(roleType).forEach(async ([type, roleNames]) => {
            const sql = format(
                `
                UPDATE "Role" SET "type" = %L WHERE "name" IN (%L);
            `,
                type,
                roleNames
            );

            await queryRunner.query(sql);
        });

        await queryRunner.query(
            format(
                `
                UPDATE "Role" SET "chainOfCustody" = %L WHERE "name" IN (%L);
            `,
                'Product Segregation',
                roleType.Product
            )
        );
    }
}
