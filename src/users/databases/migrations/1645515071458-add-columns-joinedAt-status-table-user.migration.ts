import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { UserStatusEnum } from '~users/enums/user-status.enum';

export class AddColumnsJoinedAtStatusTableUser1645515071458 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.integer('status').default(UserStatusEnum.INVITED);
            table.timestamp('joinedAt').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.dropColumn('status');
            table.dropColumn('joinedAt');
        });
    }
}
