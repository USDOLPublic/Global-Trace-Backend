import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { FacilityTypeEnum } from '~facilities/enums/facility-type.enum';
import { generalStringCode } from '~core/helpers/string.helper';

export class CreateFarmGroupProfileForExistingFarmGroup1653552612926 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const farmGroups = await queryRunner.query(`SELECT * FROM "Facility" WHERE "type" = $1`, [
            FacilityTypeEnum.FARM_GROUP
        ]);

        for (const farmGroup of farmGroups) {
            await queryRunner.query(`INSERT INTO "FarmGroupProfile" ("facilityId", "farmGroupId") VALUES ($1, $2)`, [
                farmGroup.id,
                generalStringCode('FARM_GROUP_ID_')
            ]);
        }
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`DROP TABLE "FarmGroupProfile"`);
    }
}
