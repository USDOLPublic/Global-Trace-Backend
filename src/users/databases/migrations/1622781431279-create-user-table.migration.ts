import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateUserTable1622781431279 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('User', (table) => {
            table.primaryUuid('id');
            table.string('email').index();
            table.string('password').nullable();
            table.string('phoneNumber').nullable().index();
            table.string('firstName');
            table.string('lastName');
            table.timestamp('lastLoginAt').nullable();
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback() {
        await this.drop('User');
    }
}
