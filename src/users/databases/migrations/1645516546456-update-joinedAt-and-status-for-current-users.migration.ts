import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { UserStatusEnum } from '~users/enums/user-status.enum';
import moment from 'moment';

export class UpdateJoinedAtAndStatusForCurrentUsers1645516546456 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const invitedUserOtps = await queryRunner.query(
            `SELECT "userId" FROM "Otp" WHERE "isValid" = 'TRUE' AND "expireAt" > NOW()::date`
        );

        const invitedUserIds = invitedUserOtps.map(({ userId }) => `'${userId}'`).join(',');
        const updateStatusForPendingInvitedUserQuery = `CASE WHEN "id" IN (${invitedUserIds}) THEN ${UserStatusEnum.INVITED} ELSE ${UserStatusEnum.ACTIVE} END;`;
        const status = invitedUserIds.length ? updateStatusForPendingInvitedUserQuery : `${UserStatusEnum.ACTIVE}`;

        await queryRunner.query(`UPDATE "User" SET "joinedAt" = $1, "status" = $2`, [
            moment().format('YYYY-MM-DD hh:mm:ss'),
            status
        ]);
    }
}
