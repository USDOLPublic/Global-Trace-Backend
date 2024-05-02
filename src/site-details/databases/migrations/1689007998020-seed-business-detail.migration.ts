import { BaseMigration } from '@diginexhk/typeorm-helper';
import { QueryRunner } from 'typeorm';
import businessDetail from '~site-details/databases/data/business-detail-07-05-2023.json';
import { getInsertBusinessDetailQueryHelper } from '../helpers/get-insert-business-detail-query.helper';
import moment from 'moment';

export class SeedBusinessDetail1689007998020 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const defaultBusinessDetail = { ...businessDetail, startDateOfSeason: `07/01/${moment().year()}` };

        await queryRunner.query(getInsertBusinessDetailQueryHelper([defaultBusinessDetail]));
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`DELETE FROM "BusinessDetail"`);
    }
}
