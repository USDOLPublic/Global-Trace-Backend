import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateOtpTable1622781467603 extends BaseMigration {
    async run() {
        await this.create('Otp', (table) => {
            table.primaryUuid('id');
            table.string('token').length(255).index();
            table.timestamp('expireAt').nullable();
            table.uuid('userId').nullable().index().foreign('User');
            table.boolean('isValid').default(true);
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback() {
        await this.drop('Otp');
    }
}
